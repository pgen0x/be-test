import type { Request, Response } from 'express';
import { DepositRepository } from '../repositories/DepositRepository';
import { SuccessResponse, ErrorResponse } from '../utils/ApiResponse';

export class DepositController {
  /**
   * Fetches deposits with pagination and filtering
   * @swagger
   * /api/v1/deposits:
   *   get:
   *     tags:
   *       - Deposits
   *     security: [{"bearerAuth": []}]
   *     summary: Fetches deposits with pagination and filtering
   *     description: Returns a list of deposits with pagination, search, and filtering options
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
   *         description: Search by deposit ID or user details
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
   *         description: A list of deposits
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
   *                     deposits:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Deposit'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginatedResponse'
   *       500:
   *         description: An error occurred while fetching deposits
   */
  static async getDeposits(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const asset = req.query.asset as string;
      const status = req.query.status as string;

      const result = await DepositRepository.findAll({
        page,
        limit,
        search,
        asset,
        status,
      });

      SuccessResponse.send(res, result, 'Deposits retrieved successfully');
    } catch (error) {
      ErrorResponse.send(
        res,
        'Failed to retrieve deposits',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
