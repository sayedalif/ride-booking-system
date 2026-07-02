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
    console.log(`Auth roles: ${authRoles.join(', ')}`); // Log the roles for debugging
    
    try {
      const accessToken = req.headers.authorization;
      console.log("🚀 ~ checkAuth ~ accessToken:", accessToken);
      if (!accessToken) {
        throw new AppError(403, 'no token provided');
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;
      console.log("🚀 ~ checkAuth ~ verifiedToken:", verifiedToken);

      const isUserExists = await User.findOne({
        email: verifiedToken.email,
      });
      console.log("🚀 ~ checkAuth ~ isUserExists:", isUserExists);

      if (!isUserExists) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');
      }

      if (
        isUserExists.isActive === IsActive.BLOCKED ||
        isUserExists.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `User is ${isUserExists.isActive}`,
        );
      }

      if (isUserExists.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is deleted');
      }

      if (!verifiedToken) {
        throw new AppError(401, 'invalid token');
      }

      console.log(`User role: ${verifiedToken.role}`);

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          'You are not authorized to access this resource',
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
