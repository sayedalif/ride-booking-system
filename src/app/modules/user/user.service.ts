import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IAuthProvider, IUser, Role } from './user.interface';
import { User } from './user.model';
import bcryptjs from 'bcryptjs';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { IsActive, IDriverProfile } from './user.interface';

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
  const data = await User.find({ isDeleted: false }).select('-password'); // Exclude password field from the result
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

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

// We pick only the fields that the client is allowed to send from the Zod validation schema
type IDriverApplicationPayload = Pick<
  IDriverProfile,
  'licenseNumber' | 'nidNumber' | 'vehicleDetails'
>;

const applyForDriver = async (userId: string, payload: IDriverApplicationPayload) => {
  // 1. Fetch the user to check their current driver status
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // 2. Prevent re-application if already approved or pending
  if (user.driverProfile) {
    if (user.driverProfile.status === IsActive.ACTIVE) {
      throw new Error('You are already an active driver on our platform');
    }
    if (user.driverProfile.status === IsActive.PENDING) {
      throw new Error('Your previous driver application is already pending admin review');
    }
  }

  // 3. Construct the full driver profile object with backend-controlled defaults
  const driverProfileData: IDriverProfile = {
    status: IsActive.PENDING, // Forces status to PENDING regardless of user input
    licenseNumber: payload.licenseNumber,
    nidNumber: payload.nidNumber,
    vehicleDetails: payload.vehicleDetails,
    isOnline: false,
    rating: 5.0, // Start new drivers with a fresh 5.0 rating
    appliedAt: new Date(),
  };

  // 4. Update the user document by setting the driver profile object
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { 
      $set: { driverProfile: driverProfileData } 
    },
    { 
      new: true, // Returns the modified document rather than the original
      runValidators: true // Ensures Mongoose enums are respected
    }
  ).select('-passwordHash'); // Exclude sensitive data from the return value

  return updatedUser;
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

interface IUpdateStatusPayload {
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
}

const updateUserAdministrativeStatus = async (userId: string, payload: IUpdateStatusPayload) => {
  // 1. Verify user exists before updating
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found'); // Replace with your custom AppError if you use one
  }

  // 2. Perform the update
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { 
      new: true, // Returns the modified document
      runValidators: true // Ensures Mongoose enum validations are respected
    }
  ).select('-password'); // Exclude password from the response

  return updatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  applyForDriver,
  // updateUserApproval,
  updateUserAdministrativeStatus
};
