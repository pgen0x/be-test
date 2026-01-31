import prisma from '../../prisma/client';

export class WithdrawRepository {
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
        { withdrawId: { contains: search, mode: 'insensitive' } },
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

    const [withdraws, total] = await Promise.all([
      prisma.withdraw.findMany({
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
      prisma.withdraw.count({ where }),
    ]);

    return {
      withdraws,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
