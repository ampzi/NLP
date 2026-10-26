import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const publicSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Used by AuthService.register — password already hashed
  create(data: { email: string; name: string; password: string }) {
    return this.prisma.user.create({ data, select: publicSelect });
  }

  findAll() {
    return this.prisma.user.findMany({ select: publicSelect });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  // Used by JwtStrategy — returns null instead of throwing
  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: publicSelect,
    });
  }

  // Only place password leaves the DB
  findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicSelect,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
