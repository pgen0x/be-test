import prisma from '../../prisma/client';

export class StatsRepository {
  static async getDashboardMetrics(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalDeposit,
      totalWithdraw,
      totalRegistered,
      totalVerifiedKyc,
      dailyStats,
      dailyWithdrawsStats,
    ] = await Promise.all([
      // Total Deposits (IDR ONLY)
      prisma.deposit.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          asset: 'IDR',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),

      // Total Withdraws (IDR ONLY)
      prisma.withdraw.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          asset: 'IDR',
        },
        _sum: {
          amount: true,
          amountNett: true,
        },
        _count: {
          id: true,
        },
      }),

      // Total Registered Users
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total Verified KYC
      prisma.user.count({
        where: {
          isKycVerified: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Daily deposits for chart (IDR ONLY)
      prisma.deposit.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          asset: 'IDR',
        },
        _sum: {
          amount: true,
        },
      }),

      // Daily withdraws for chart (IDR ONLY)
      prisma.withdraw.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          asset: 'IDR',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Process daily stats into a consistent format for the chart (1-31 days)
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1, 1).toLocaleString('id-ID', { month: 'short' });
    
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        name: `${day} ${monthName}`,
        deposit: 0,
        withdraw: 0,
      };
    });

    const dailyDeposits = dailyStats as any[];
    const dailyWithdraws = dailyWithdrawsStats as any[];

    dailyDeposits.forEach((stat) => {
      const day = stat.createdAt.getDate();
      if (chartData[day - 1]) {
        chartData[day - 1].deposit += stat._sum.amount || 0;
      }
    });

    dailyWithdraws.forEach((stat) => {
      const day = stat.createdAt.getDate();
      if (chartData[day - 1]) {
        chartData[day - 1].withdraw += stat._sum.amount || 0;
      }
    });

    return {
      totalDeposit: totalDeposit._sum.amount || 0,
      depositCount: totalDeposit._count.id || 0,
      totalWithdraw: totalWithdraw._sum.amount || 0,
      withdrawCount: totalWithdraw._count.id || 0,
      totalRegistered,
      totalVerifiedKyc,
      chartData,
    };
  }
}
