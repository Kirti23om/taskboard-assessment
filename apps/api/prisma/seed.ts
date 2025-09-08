import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('Password@123', 10);
  const testerPassword = await bcrypt.hash('Password@123', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.io' },
    update: {},
    create: {
      email: 'admin@test.io',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const tester = await prisma.user.upsert({
    where: { email: 'tester@test.io' },
    update: {},
    create: {
      email: 'tester@test.io',
      passwordHash: testerPassword,
      role: 'TESTER',
    },
  });

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      name: 'Website Revamp',
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'project-2' },
    update: {},
    create: {
      id: 'project-2',
      name: 'Mobile App',
    },
  });

  // Create tasks with varied status, priority, and due dates
  const tasks = [
    {
      id: 'task-1',
      projectId: project1.id,
      title: 'Design homepage mockup',
      status: 'todo',
      priority: 'high',
      assigneeEmail: 'tester@test.io',
      dueDate: new Date('2025-01-15'),
    },
    {
      id: 'task-2',
      projectId: project1.id,
      title: 'Implement user authentication',
      status: 'in_progress',
      priority: 'high',
      assigneeEmail: 'admin@test.io',
      dueDate: new Date('2025-01-20'),
    },
    {
      id: 'task-3',
      projectId: project1.id,
      title: 'Write unit tests',
      status: 'done',
      priority: 'med',
      assigneeEmail: 'tester@test.io',
      dueDate: new Date('2024-12-30'), // Past due
    },
    {
      id: 'task-4',
      projectId: project2.id,
      title: 'Setup React Native project',
      status: 'todo',
      priority: 'med',
      assigneeEmail: null,
      dueDate: new Date('2025-02-01'),
    },
    {
      id: 'task-5',
      projectId: project2.id,
      title: 'Design app icons',
      status: 'in_progress',
      priority: 'low',
      assigneeEmail: 'tester@test.io',
      dueDate: null,
    },
    {
      id: 'task-6',
      projectId: project2.id,
      title: 'Configure app store deployment',
      status: 'todo',
      priority: 'low',
      assigneeEmail: 'admin@test.io',
      dueDate: new Date('2025-03-15'),
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.upsert({
      where: { id: taskData.id },
      update: {},
      create: taskData,
    });
  }

  // Create some activity logs
  const activityLogs = [
    {
      taskId: 'task-1',
      type: 'create',
      by: admin.id,
    },
    {
      taskId: 'task-2',
      type: 'create',
      by: admin.id,
    },
    {
      taskId: 'task-2',
      type: 'update',
      by: tester.id,
    },
    {
      taskId: 'task-3',
      type: 'create',
      by: tester.id,
    },
    {
      taskId: 'task-3',
      type: 'update',
      by: tester.id,
    },
  ];

  for (const logData of activityLogs) {
    await prisma.activityLog.create({
      data: logData,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Users:');
  console.log('  admin@test.io / Password@123 (ADMIN)');
  console.log('  tester@test.io / Password@123 (TESTER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
