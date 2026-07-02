import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser, Role } from './user.interface';
import { User } from './user.model';
import bcryptjs from 'bcryptjs';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User already exists');
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = userObj; // Exclude password from the returned object
  return userWithoutPassword;
};

const getAllUsers = async () => {
  const data = await User.find();
  const totalUsers = await User.countDocuments();

  return {
    data,
    meta: {
      total: totalUsers,
    },
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  /*
   * email - can not update
   * name, phone, password, adress
   * password - re hashing
   * only admin super admin can change - role, isDeleted, isActive, isVerified
   * admin can not change super admin role
   */

  // rider and driver can not update user roles
  if (payload.role) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }

    // admin can not change super admin role
    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }
  }

  // only admin and super admin can change isActive, isDeleted, isVerified
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }
  }

  // re-hashing password if password is being updated
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password as string,
      parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

/* const updateUserApproval = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // rider and driver can not update user roles
  if (payload.role) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }

    // admin can not change super admin role
    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }
  }

  // only admin and super admin can change isActive, isDeleted, isVerified
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized');
    }
  }

  // re-hashing password if password is being updated
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password as string,
      parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
}; */

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
};
