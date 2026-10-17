// src/user/user.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UserService {
  private readonly users: User[] = [];
  private nextId = 1;

  create(dto: CreateUserDto): User {
    this.assertValidCreate(dto);
    this.assertEmailFree(dto.email);

    const user: User = {
      id: this.nextId++,
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  update(id: number, dto: UpdateUserDto): User {
    const user = this.findOne(id);

    if (dto.name !== undefined) {
      this.assertName(dto.name);
      user.name = dto.name.trim();
    }
    if (dto.email !== undefined) {
      this.assertEmail(dto.email);
      const normalized = dto.email.trim().toLowerCase();
      this.assertEmailFree(normalized, id); // allow keeping own email
      user.email = normalized;
    }
    return user;
  }

  remove(id: number): User {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException(`User #${id} not found`);
    return this.users.splice(index, 1)[0];
  }

  // ---- manual validation helpers ----

  private assertValidCreate(dto: CreateUserDto): void {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Body must be an object');
    }
    this.assertName(dto.name);
    this.assertEmail(dto.email);
  }

  private assertName(name: unknown): void {
    if (typeof name !== 'string' || name.trim().length < 2) {
      throw new BadRequestException(
        'name must be a string of at least 2 chars',
      );
    }
  }

  private assertEmail(email: unknown): void {
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new BadRequestException('email must be a valid email address');
    }
  }

  private assertEmailFree(email: string, exceptId?: number): void {
    const exists = this.users.some(
      (u) => u.email === email && u.id !== exceptId,
    );
    if (exists) throw new ConflictException(`email ${email} already in use`);
  }
}
