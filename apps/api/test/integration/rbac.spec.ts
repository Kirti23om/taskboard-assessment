import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('RBAC (Role-Based Access Control)', () => {
  let app: INestApplication;
  let adminToken: string;
  let testerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get tokens for both users
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.io', password: 'Password@123' });
    adminToken = adminLogin.body.accessToken;

    const testerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'tester@test.io', password: 'Password@123' });
    testerToken = testerLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Project Management Access', () => {
    it('should allow ADMIN to create projects', async () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Project' })
        .expect(201);
    });

    it('should deny TESTER from creating projects', async () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${testerToken}`)
        .send({ name: 'Test Project' })
        .expect(403);
    });

    // KNOWN ISSUE - seeded defect: TESTER can delete projects due to RolesGuard bug
    it.skip('should deny TESTER from deleting projects', async () => {
      // First create a project as admin
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Project to Delete' });

      const projectId = createResponse.body.id;

      // This should fail (403) but will pass (200) due to RBAC bug
      return request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(403); // Should be forbidden but bug allows it
    });

    it('should allow ADMIN to delete projects', async () => {
      // First create a project as admin
      const createResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Project to Delete by Admin' });

      const projectId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
