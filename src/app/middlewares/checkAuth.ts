import { NextFunction, Request, Response } from 'express';
import AppError from '../errorHelpers/AppError';
import { verifyToken } from '../utils/jwt';
import { envVars } from '../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { StatusCodes } from 'http-status-codes';
import { IsActive } from '../modules/user/user.interface';

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new AppError(403, 'no token provided');
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExists = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');
      }

      if (
        isUserExists.isActive === IsActive.BLOCKED ||
        isUserExists.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `User is ${isUserExists.isActive}`
        );
      }

      if (isUserExists.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is deleted');
      }

      if (!verifiedToken) {
        throw new AppError(401, 'invalid token');
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          'You are not authorized to access this resource'
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
