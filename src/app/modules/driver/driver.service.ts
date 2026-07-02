import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
// import { IAuthProvider, IUser, Role } from './user.interface';
import bcryptjs from 'bcryptjs';
import { envVars } from '../../config/env';
// import { JwtPayload } from 'jsonwebtoken';
import { Driver } from './driver.model';
import { IDriver } from './driver.interface';
import { IAuthProvider, Role } from '../user/user.interface';
import { JwtPayload } from 'jsonwebtoken';

const createDriver = async (payload: Partial<IDriver>) => {
  const { email, password, ...rest } = payload;

  const isDriverExists = await Driver.findOne({ email });
  if (isDriverExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Driver already exists');
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const driver = await Driver.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });
  return driver;
};

const getAllDrivers = async () => {
  const data = await Driver.find();
  const totalDrivers = await Driver.countDocuments();

  return {
    data,
    meta: {
      total: totalDrivers,
    },
  };
};

const updateDriver = async (
  driverId: string,
  payload: Partial<IDriver>,
  decodedToken: JwtPayload
) => {
  const isDriverExists = await Driver.findById(driverId);

  if (!isDriverExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Driver not found');
  }

  /*
   * email - can not update
   * name, phone, password, address
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

  const newUpdatedDriver = await Driver.findByIdAndUpdate(driverId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedDriver;
};

export const DriverServices = {
  createDriver,
  getAllDrivers,
  updateDriver,
};
