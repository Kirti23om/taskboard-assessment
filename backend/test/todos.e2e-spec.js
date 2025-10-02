const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../src/app.module');
const { PrismaService } = require('../src/prisma/prisma.service');

let app;
let prisma;

describe('Todos API (e2e)', () => {
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma['todo'].deleteMany();
  });

  it('should return 400 for empty title on create', async () => {
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: '', description: 'desc' })
      .set('Authorization', 'Bearer user1')
    process.env.DATABASE_URL = 'file:./test.db';
    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });

  });

  it('should sanitize description on create', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'Test', description: '<script>alert(1)</script>desc' })
      .set('Authorization', 'Bearer user1');
    expect(res.body.description).toBe('desc');
  });

  it('should return 403 if user does not own todo', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'Test', description: 'desc' })
      .set('Authorization', 'Bearer user1');
    await request(app.getHttpServer())
      .get(`/todos/${res.body.id}`)
      .set('Authorization', 'Bearer user2')
      .expect(403);
  });

  it('should return 409 on version mismatch (optimistic locking)', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'Test', description: 'desc' })
      .set('Authorization', 'Bearer user1');
    await request(app.getHttpServer())
      .put(`/todos/${res.body.id}`)
      .send({ version: res.body.version + 1, title: 'New' })
      .set('Authorization', 'Bearer user1')
      .expect(409);
  });

  it('should create multiple todos in bulkCreate', async () => {
    const todos = [
      { title: 'Bulk1', description: 'desc1' },
      { title: 'Bulk2', description: 'desc2' },
    ];
    const res = await request(app.getHttpServer())
      .post('/todos/bulk')
      .send({ todos })
      .set('Authorization', 'Bearer user1');
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Bulk1');
    expect(res.body[1].title).toBe('Bulk2');
  });

  it('should return 400 for invalid bulkCreate', async () => {
    const todos = [
      { title: '', description: 'desc1' },
      { title: 'Bulk2', description: 'desc2' },
    ];
    await request(app.getHttpServer())
      .post('/todos/bulk')
      .send({ todos })
      .set('Authorization', 'Bearer user1')
      .expect(400);
  });

  it('should delete only user-owned todos in bulkDelete', async () => {
    const todo1 = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'A', description: '' })
      .set('Authorization', 'Bearer user1');
    const todo2 = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'B', description: '' })
      .set('Authorization', 'Bearer user2');
    const res = await request(app.getHttpServer())
      .delete('/todos/bulk')
      .send({ ids: [todo1.body.id, todo2.body.id] })
      .set('Authorization', 'Bearer user1');
    expect(res.body.deleted).toContain(todo1.body.id);
    expect(res.body.notFound).toContain(todo2.body.id);
  });

  it('should handle optimistic locking', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'LockTest', description: 'desc' })
      .set('Authorization', 'Bearer user1');
    // Update with correct version
    await request(app.getHttpServer())
      .put(`/todos/${res.body.id}`)
      .send({ version: res.body.version, title: 'LockTestUpdated' })
      .set('Authorization', 'Bearer user1')
      .expect(200);
    // Update with wrong version
    await request(app.getHttpServer())
      .put(`/todos/${res.body.id}`)
      .send({ version: res.body.version, title: 'ShouldFail' })
      .set('Authorization', 'Bearer user1')
      .expect(409);
  });

  it('should perform bulk operations', async () => {
    // Bulk create
    const todos = [
      { title: 'BulkA', description: 'descA' },
      { title: 'BulkB', description: 'descB' },
    ];
    const res = await request(app.getHttpServer())
      .post('/todos/bulk')
      .send({ todos })
      .set('Authorization', 'Bearer user1');
    expect(res.body.length).toBe(2);
    // Bulk delete
    const ids = res.body.map((t) => t.id);
    const delRes = await request(app.getHttpServer())
      .delete('/todos/bulk')
      .send({ ids })
      .set('Authorization', 'Bearer user1');
    expect(delRes.body.deleted).toEqual(expect.arrayContaining(ids));
  });

  it('should check authorization', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'AuthTest', description: 'desc' })
      .set('Authorization', 'Bearer user1');
    await request(app.getHttpServer())
      .delete(`/todos/${res.body.id}`)
      .set('Authorization', 'Bearer user2')
      .expect(403);
  });

  it('should sanitize input', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'SanitizeTest', description: '<b>desc</b><script>evil()</script>' })
      .set('Authorization', 'Bearer user1');
    expect(res.body.description).toBe('desc');
  });
});
