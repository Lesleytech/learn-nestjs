import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}
  private tasks: Task[] = [];

  async getTasks({ status, search }: GetTasksFilterDto): Promise<Task[]> {
    const query = this.taskRepo.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    return await query.getMany();
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.taskRepo.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.taskRepo.save(task);

    return task;
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  async deleteTask(id: string) {
    const result = await this.taskRepo.delete({ id });

    if (!result.affected) {
      throw new NotFoundException();
    }
  }

  async updateTask(id: string, updates: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(id);
    const updatedTask: Task = { ...task, ...updates };

    await this.taskRepo.save(updatedTask);

    return updatedTask;
  }
}
