import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Injectable()
export class UsersService {
  constructor(private dataService: DataService) {}

  async findByEmail(email: string) {
    return this.dataService.findUserByEmail(email);
  }

  async findById(id: string) {
    return this.dataService.findUserById(id);
  }
}
