import type { Request, Response } from 'express';

import { UserRepository } from '../repositories/UserRepository';
import { ErrorResponse, SuccessResponse } from '../utils/ApiResponse';

export class UserController {
  /**
   * Fetches all users in the database with pagination and search
   * @swagger
   * /api/v1/users:
   *   get:
   *     tags:
   *       - Users
   *     security: [{"bearerAuth": []}]
   *     summary: Fetches all users with pagination and search
   *     description: Returns a list of all users in the database with pagination and search capabilities
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
   *         description: Search by name, email, or username
   *     responses:
   *       200:
   *         description: A list of users
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
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginatedResponse'
   *       500:
   *         description: An error occurred while fetching users
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async getUsers(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    try {
      const [users, count] = await Promise.all([
        UserRepository.findAll(limit, offset, search),
        UserRepository.count(search), 
      ]);

      SuccessResponse.send(
        res,
        {
          users,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: offset / limit + 1,
        },
        'Users fetched successfully'
      );
    } catch (error) {
      ErrorResponse.send(
        res,
        'Failed to fetch users',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Fetches the current user's profile
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     tags:
   *       - Auth
   *     security: [{"bearerAuth": []}]
   *     summary: Fetches the current user profile
   *     description: Returns the details of the currently authenticated user
   *     responses:
   *       200:
   *         description: The current user profile
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   *       500:
   *         description: An error occurred while fetching user profile
   */
  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await UserRepository.findById(userId);

      if (!user) {
        return ErrorResponse.send(res, 'User not found', 404);
      }

      SuccessResponse.send(res, user, 'User profile fetched successfully');
    } catch (error) {
      ErrorResponse.send(
        res,
        'Failed to fetch user profile',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
