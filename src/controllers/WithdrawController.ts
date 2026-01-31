import type { Request, Response } from 'express';
import { WithdrawRepository } from '../repositories/WithdrawRepository';
import { SuccessResponse, ErrorResponse } from '../utils/ApiResponse';

export class WithdrawController {
  /**
   * Fetches withdrawals with pagination and filtering
   * @swagger
   * /api/v1/withdraws:
   *   get:
   *     tags:
   *       - Withdraws
   *     security: [{"bearerAuth": []}]
   *     summary: Fetches withdrawals with pagination and filtering
   *     description: Returns a list of withdrawals with pagination, search, and filtering options
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: The page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: The number of items to return
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by withdraw ID or user details
   *       - in: query
   *         name: asset
   *         schema:
   *           type: string
   *         description: Filter by asset (e.g., IDR, BTC)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, SUCCESS, REJECTED]
   *         description: Filter by transaction status
   *     responses:
   *       200:
   *         description: A list of withdrawals
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     withdraws:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Withdraw'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginatedResponse'
   *       500:
   *         description: An error occurred while fetching withdrawals
   */
  static async getWithdraws(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const asset = req.query.asset as string;
      const status = req.query.status as string;

      const result = await WithdrawRepository.findAll({
        page,
        limit,
        search,
        asset,
        status,
      });

      SuccessResponse.send(res, result, 'Withdraws retrieved successfully');
    } catch (error) {
      ErrorResponse.send(
        res,
        'Failed to retrieve withdraws',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
