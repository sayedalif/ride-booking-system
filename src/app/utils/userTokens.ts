import { StatusCodes } from 'http-status-codes';
import AppError from '../errorHelpers/AppError';
import { IsActive, IUser } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { generateToken, verifyToken } from './jwt';
import { envVars } from '../config/env';
import { JwtPayload } from 'jsonwebtoken';

export const createUserTokens = (user: Partial<IUser>) => {
  console.log('🚀 ~ createUserTokens ~ user:', user);

  console.log('_id:', user._id);
  console.log('email:', user.email);
  console.log('role:', user.role);

  if (!user._id || !user.email || !user.role) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'User object is missing required fields for token generation',
    );
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES as string,
  );
  console.log('🚀 ~ createUserTokens ~ accessToken:', accessToken);

  const refreshToken = generateToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string,
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  ) as JwtPayload;

  const isUserExists = await User.findOne({
    email: verifiedRefreshToken.email,
  });
  console.log(
    '🚀 ~ createNewAccessTokenWithRefreshToken ~ isUserExists:',
    isUserExists,
  );

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

  const jwtPayload = {
    userId: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );
  console.log(
    '🚀 ~ createNewAccessTokenWithRefreshToken ~ accessToken:',
    accessToken,
  );

  return accessToken;
};
