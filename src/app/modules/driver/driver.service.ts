import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IsActive, Role } from '../user/user.interface';
import { User } from '../user/user.model';
import { Ride } from '../ride/ride.model';
import mongoose from 'mongoose';

const getAllDrivers = async () => {
  // Finds all users who have initiated a driver profile setup
  const drivers = await User.find({
    driverProfile: { $ne: null },
  })
    .select('-password') // Always exclude passwords from administrative list views
    .sort({ 'driverProfile.appliedAt': -1 }); // Newest applications/drivers first

  const totalDrivers = await User.countDocuments({
    driverProfile: { $ne: null },
  });

  return {
    data: drivers,
    meta: {
      total: totalDrivers,
    },
  };
};

const approveDriver = async (driverId: string) => {
  // 1. Fetch the user down to check their profile state
  const user = await User.findById(driverId);

  if (!user) {
    throw new Error('User not found');
  }

  // 2. Strict Guard: Check if a driver profile even exists
  if (!user.driverProfile) {
    throw new Error('This user has not submitted a driver application.');
  }

  // 3. Prevent redundant approvals or approving blocked applications
  if (user.driverProfile.status === IsActive.ACTIVE) {
    throw new Error('This driver profile is already active.');
  }

  if (user.driverProfile.status !== IsActive.PENDING) {
    throw new Error(
      `Cannot approve a driver application with status: ${user.driverProfile.status}`,
    );
  }

  // 4. Data Integrity Guard: Ensure all mandatory documents/info are structurally present
  const { licenseNumber, nidNumber, vehicleDetails } = user.driverProfile;

  if (
    !licenseNumber ||
    !nidNumber ||
    !vehicleDetails ||
    !vehicleDetails.type ||
    !vehicleDetails.plateNumber
  ) {
    throw new Error(
      'Cannot approve: Driver application is missing required documentation or vehicle details.',
    );
  }

  // 5. Atomic Update: Set the profile to ACTIVE and upgrade their main role to DRIVER
  const approvedDriver = await User.findByIdAndUpdate(
    driverId,
    {
      $set: {
        'driverProfile.status': IsActive.ACTIVE,
        role: Role.DRIVER, // Formally changes their system accessibility role
      },
    },
    {
      new: true, // Return updated document
      runValidators: true,
    },
  ).select('-password'); // Strip sensitive data before returning to controller

  return approvedDriver;
};

const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  // 1. Fetch the driver's current record
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Driver account not found');
  }

  if (!user.driverProfile) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'This user does not have a driver profile setup.');
  }

  // 2. Safety Guardrail: Block drivers who are pending review, suspended, or blocked from going online
  if (user.driverProfile.status !== IsActive.ACTIVE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Access Denied: You cannot change availability while your profile status is: ${user.driverProfile.status}`,
    );
  }

  // 3. Perform atomic update directly to the nested profile path
  const updatedDriver = await User.findByIdAndUpdate(
    userId,
    {
      $set: { 'driverProfile.isOnline': isOnline },
    },
    {
      new: true, // Return the fresh document
      runValidators: true,
    },
  ).select('-password'); // Secure sensitive records

  return updatedDriver;
};

const getDriverEarnings = async (driverId: string) => {
  // 1. Verify the driver exists and their profile is ACTIVE
  const driver = await User.findById(driverId);
  
  if (!driver) {
    throw new Error('User not found');
  }
  
  if (driver.driverProfile?.status !== IsActive.ACTIVE) {
    throw new Error(`Access Denied: Your driver profile is currently ${driver.driverProfile?.status || 'INACTIVE'}.`);
  }

  // 2. Setup date boundaries for the queries
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // 3. Execute the Aggregation Pipeline
  const earningsStats = await Ride.aggregate([
    {
      // Filter strictly by this driver and only 'completed' rides
      $match: {
        driverId: new mongoose.Types.ObjectId(driverId),
        status: 'completed',
      },
    },
    {
      // Group them all together and calculate conditional sums
      $group: {
        _id: null,
        totalEarnings: { $sum: '$estimatedFare' },
        last7Days: {
          $sum: {
            $cond: [{ $gte: ['$updatedAt', sevenDaysAgo] }, '$estimatedFare', 0],
          },
        },
        last30Days: {
          $sum: {
            $cond: [{ $gte: ['$updatedAt', thirtyDaysAgo] }, '$estimatedFare', 0],
          },
        },
        yearlyIncome: {
          $sum: {
            $cond: [{ $gte: ['$updatedAt', startOfYear] }, '$estimatedFare', 0],
          },
        },
      },
    },
  ]);

  // 4. Handle edge case: If the driver has no completed rides yet, it returns an empty array
  if (earningsStats.length === 0) {
    return {
      totalEarnings: 0,
      last7Days: 0,
      last30Days: 0,
      yearlyIncome: 0,
    };
  }

  // Strip out the null _id MongoDB adds and return the clean data
  const { _id, ...stats } = earningsStats[0];
  return stats;
};

export const DriverServices = {
  getAllDrivers,
  approveDriver,
  updateOnlineStatus,
  getDriverEarnings
};
