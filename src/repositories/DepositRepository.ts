import prisma from '../../prisma/client';

export class DepositRepository {
  static async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    asset?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, asset, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { depositId: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (asset) {
      where.asset = asset;
    }

    if (status) {
      where.status = status;
    }

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deposit.count({ where }),
    ]);

    return {
      deposits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
