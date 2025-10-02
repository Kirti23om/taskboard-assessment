const { Test } = require('@nestjs/testing');
const { TodosService } = require('./todos.service');
const { PrismaService } = require('../prisma/prisma.service');

describe('TodosService', () => {
  let service;
  let prisma;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TodosService, PrismaService],
    }).compile();
    service = module.get(TodosService);
    prisma = module.get(PrismaService);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma['todo'].deleteMany();
  });

  it('should throw BadRequestException for empty title on create', async () => {
    await expect(
      service.create({ title: '', description: 'desc' }, 'user1')
    ).rejects.toThrow('Title cannot be empty');
  });

  it('should sanitize description on create', async () => {
    const todo = await service.create({ title: 'Test', description: '<script>alert(1)</script>desc' }, 'user1');
    expect(todo.description).toBe('desc');
  });

  it('should throw ForbiddenException if user does not own todo', async () => {
    const created = await service.create({ title: 'Test', description: 'desc' }, 'user1');
    await expect(service.findOne(created.id, 'user2')).rejects.toThrow('Access denied');
  });

  it('should throw ConflictException on version mismatch (optimistic locking)', async () => {
    const created = await service.create({ title: 'Test', description: 'desc' }, 'user1');
    await expect(
      service.update(created.id, { version: created.version + 1, title: 'New' }, 'user1')
    ).rejects.toThrow('Version mismatch');
  });

  it('should create multiple todos in bulkCreate', async () => {
    const todos = [
      { title: 'Bulk1', description: 'desc1' },
      { title: 'Bulk2', description: 'desc2' },
    ];
    const result = await service.bulkCreate({ todos }, 'user1');
    expect(result.length).toBe(2);
    expect(result[0].title).toBe('Bulk1');
    expect(result[1].title).toBe('Bulk2');
  });

  it('should throw BadRequestException for invalid bulkCreate', async () => {
    const todos = [
      { title: '', description: 'desc1' },
      { title: 'Bulk2', description: 'desc2' },
    ];
    await expect(service.bulkCreate({ todos }, 'user1')).rejects.toThrow('Title cannot be empty');
  });

  it('should delete only user-owned todos in bulkDelete', async () => {
    const todo1 = await service.create({ title: 'A', description: '' }, 'user1');
    const todo2 = await service.create({ title: 'B', description: '' }, 'user2');
    const result = await service.bulkDelete({ ids: [todo1.id, todo2.id] }, 'user1');
    expect(result.deleted).toContain(todo1.id);
    expect(result.notFound).toContain(todo2.id);
  });

  it('should handle optimistic locking', async () => {
    const created = await service.create({ title: 'LockTest', description: 'desc' }, 'user1');
    // Update with correct version
    const updated = await service.update(created.id, { version: created.version, title: 'LockTestUpdated' }, 'user1');
    expect(updated.title).toBe('LockTestUpdated');
    // Update with wrong version
    await expect(
      service.update(created.id, { version: created.version, title: 'ShouldFail' }, 'user1')
    ).rejects.toThrow('Version mismatch');
  });

  it('should perform bulk operations', async () => {
    // Bulk create
    const todos = [
      { title: 'BulkA', description: 'descA' },
      { title: 'BulkB', description: 'descB' },
    ];
    const result = await service.bulkCreate({ todos }, 'user1');
    expect(result.length).toBe(2);
    // Bulk delete
    const ids = result.map((t) => t.id);
    const delResult = await service.bulkDelete({ ids }, 'user1');
    expect(delResult.deleted).toEqual(expect.arrayContaining(ids));
  });

  it('should check authorization', async () => {
    const created = await service.create({ title: 'AuthTest', description: 'desc' }, 'user1');
    await expect(service.remove(created.id, 'user2')).rejects.toThrow('Access denied');
  });

  it('should sanitize input', async () => {
    const created = await service.create({ title: 'SanitizeTest', description: '<b>desc</b><script>evil()</script>' }, 'user1');
    expect(created.description).toBe('desc');
  });
});
