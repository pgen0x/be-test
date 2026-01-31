import type { Request, Response } from 'express';
import { StatsRepository } from '../repositories/StatsRepository';
import { ErrorResponse, SuccessResponse } from '../utils/ApiResponse';

export class StatsController {
  /**
   * Fetches dashboard statistics with filtering
   * @swagger
   * /api/v1/stats/dashboard:
   *   get:
   *     tags:
   *       - Stats
   *     security: [{"bearerAuth": []}]
   *     summary: Fetches dashboard statistics
   *     description: Returns aggregated metrics for deposits, withdraws, users, and kyc status filtered by month and year
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: integer
   *         example: 1
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *         example: 2024
   *     responses:
   *       200:
   *         description: Dashboard statistics fetched successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

      const stats = await StatsRepository.getDashboardMetrics(month, year);

      SuccessResponse.send(res, stats, 'Dashboard statistics fetched successfully');
    } catch (error) {
      ErrorResponse.send(
        res,
        'Failed to fetch dashboard statistics',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
