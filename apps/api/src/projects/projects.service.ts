import { Injectable, NotFoundException } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private dataService: DataService) {}

  async findAll() {
    const projects = this.dataService.getProjects();
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findOne(id: string) {
    const project = this.dataService.findProjectById(id);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async create(createProjectDto: CreateProjectDto) {
    return this.dataService.createProject(createProjectDto);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = this.dataService.updateProject(id, updateProjectDto);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    return project;
  }

  async remove(id: string) {
    const deleted = this.dataService.deleteProject(id);
    
    if (!deleted) {
      throw new NotFoundException('Project not found');
    }
    
    return { message: 'Project deleted successfully' };
  }
}
