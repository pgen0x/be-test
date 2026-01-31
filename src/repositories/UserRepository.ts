import prisma from '../../prisma/client';
import { DEFAULT_SORT_ORDER } from '../constants';

export class UserRepository {
  static async findAll(limit: number = 10, offset: number = 0, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        isKycVerified: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: DEFAULT_SORT_ORDER,
      },
      take: limit,
      skip: offset,
    });
  }

  static async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    status: string;
  }) {
    return prisma.user.create({ data });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        status: true,
        isKycVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async count(search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.user.count({ where });
  }
}
