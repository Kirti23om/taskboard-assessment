import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: string;
  priority: string;
  assigneeEmail?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  type: string;
  ts: string;
  by: string;
}

@Injectable()
export class DataService {
  private readonly dataDir = join(__dirname, 'data');

  constructor() {
    // Hash passwords for seed data (Password@123)
    this.initializeData();
  }

  private async initializeData() {
    try {
      const users = this.getUsers();
      let needsUpdate = false;

      for (const user of users) {
        // Check if password is already hashed
        if (!user.passwordHash.startsWith('$2b$')) {
          user.passwordHash = await bcrypt.hash('Password@123', 10);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        this.writeData('users.json', users);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  private readData<T>(filename: string): T[] {
    try {
      const filePath = join(this.dataDir, filename);
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  private writeData<T>(filename: string, data: T[]): void {
    try {
      const filePath = join(this.dataDir, filename);
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Users
  getUsers(): User[] {
    return this.readData<User>('users.json');
  }

  findUserByEmail(email: string): User | undefined {
    return this.getUsers().find(user => user.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  // Projects
  getProjects(): Project[] {
    return this.readData<Project>('projects.json');
  }

  findProjectById(id: string): Project | undefined {
    return this.getProjects().find(project => project.id === id);
  }

  createProject(data: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: this.generateId('project'),
      ...data,
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    this.writeData('projects.json', projects);
    return newProject;
  }

  updateProject(id: string, data: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = { ...projects[index], ...data };
    this.writeData('projects.json', projects);
    return projects[index];
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    projects.splice(index, 1);
    this.writeData('projects.json', projects);

    // Also delete related tasks
    const tasks = this.getTasks().filter(t => t.projectId !== id);
    this.writeData('tasks.json', tasks);

    return true;
  }

  // Tasks
  getTasks(): Task[] {
    return this.readData<Task>('tasks.json');
  }

  findTaskById(id: string): Task | undefined {
    return this.getTasks().find(task => task.id === id);
  }

  getTasksByProject(projectId: string): Task[] {
    return this.getTasks().filter(task => task.projectId === projectId);
  }

  createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: this.generateId('task'),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.writeData('tasks.json', tasks);
    return newTask;
  }

  updateTask(id: string, data: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = { 
      ...tasks[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    };
    this.writeData('tasks.json', tasks);
    return tasks[index];
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    tasks.splice(index, 1);
    this.writeData('tasks.json', tasks);

    // Also delete related activity logs
    const logs = this.getActivityLogs().filter(l => l.taskId !== id);
    this.writeData('activity-logs.json', logs);

    return true;
  }

  // Activity Logs
  getActivityLogs(): ActivityLog[] {
    return this.readData<ActivityLog>('activity-logs.json');
  }

  getActivityLogsByTask(taskId: string): ActivityLog[] {
    return this.getActivityLogs()
      .filter(log => log.taskId === taskId)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }

  createActivityLog(data: Omit<ActivityLog, 'id' | 'ts'>): ActivityLog {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: this.generateId('log'),
      ...data,
      ts: new Date().toISOString(),
    };
    logs.push(newLog);
    this.writeData('activity-logs.json', logs);
    return newLog;
  }
}
