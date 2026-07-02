/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IsActive, IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from '../../utils/userTokens';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });
//   if (!isUserExist) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'User does not exist');
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
//   }

//   const userToken = await createUserTokens(isUserExist);

//   const { password: pass, ...rest } = isUserExist.toObject();

//   return {
//     accessToken: userToken.accessToken,
//     refreshToken: userToken.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isOldPasswordMatched = await bcryptjs.compare(
    oldPassword,
    user?.password as string
  );

  if (!isOldPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Old Password is incorrect');
  }

  const newHashedPassword = await bcryptjs.hash(
    newPassword,
    parseInt(envVars.BCRYPT_SALT_ROUNDS)
  );

  user.password = newHashedPassword;

  await user?.save();
};

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
