import { Ride } from './ride.model';
import { calculateFare } from '../../utils/calculateFare';
import { CreateRidePayload } from './ride.interface';
import AppError from '../../errorHelpers/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { Role } from '../user/user.interface';

const createRideService = async (payload: CreateRidePayload) => {
  const { riderId, pickupAddress, destinationAddress, distanceKm, rideType } =
    payload;

  const estimatedFare = calculateFare({ distanceKm, rideType });

  const ride = await Ride.create({
    riderId,
    pickup: { address: pickupAddress },
    destination: { address: destinationAddress },
    estimatedDistance: distanceKm,
    estimatedFare,
    rideType,
    status: 'pending',
  });

  return ride;
};

// ... existing imports

// Existing createRideService remains here...

const getFareQuoteService = async (payload: {
  distanceKm: number;
  rideType: 'bike' | 'car';
}) => {
  const { distanceKm, rideType } = payload;

  // Reusing your utility to calculate the fare based on distance and type
  const estimatedFare = calculateFare({ distanceKm, rideType });

  // Return the breakdown data
  return {
    distanceKm,
    rideType,
    estimatedFare,
  };
};

const cancelRideService = async (rideId: string, riderId: string) => {
  // 1. Find the ride and make sure it belongs to the requesting rider
  const ride = await Ride.findOne({ _id: rideId, riderId });

  if (!ride) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Ride not found or unauthorized');
  }

  // 2. If the ride is already in progress, reject the cancellation
  if (ride.status === 'in_progress') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Can't cancel ride now, the ride is ongoing",
    );
  }

  // 3. Handle guard rails for already completed or cancelled statuses
  if (ride.status === 'completed') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Can't cancel a completed ride",
    );
  }

  if (ride.status === 'cancelled') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Ride is already cancelled');
  }

  // 4. If status is 'pending' or 'accepted', allow the cancellation
  ride.status = 'cancelled';
  await ride.save();

  return ride;
};

const getAllRiders = async () => {
  // Finds all users whose active system access role is RIDER
  const riders = await User.find({
    role: Role.RIDER,
  })
    .select('-password') // Secure sensitive information
    .sort({ 'riderProfile.joinedAt': -1 }); // Newest signups show at the top

  return riders;
};

const getRiderHistory = async (riderId: string) => {
  // Find all rides matching this riderId
  const rideHistory = await Ride.find({ riderId })
    .populate('riderId', 'fullName phoneNumber picture') // Pull specific driver details, skip sensitive info
    .sort({ createdAt: -1 }); // Newest rides first

  return rideHistory;
};

const updateRideStatus = async (
  rideId: string,
  status: string,
  UserId: string,
  UserRole: string,
) => {
  // 1. Fetch the ride
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  // 2. Prevent changes to already completed or cancelled rides
  if (ride.status === 'completed' || ride.status === 'cancelled') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot update status. This ride is already completed or cancelled.',
    );
  }

  // prevent a driver from cancelling a ride that is pending
  if (status === 'cancelled' && ride.status === 'pending') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot cancel a pending ride. Only the rider can cancel a pending ride.',
    );
  }

  // prevent a driver from cancelling a ride that he has accepted

  if (status === 'cancelled' && ride.status === 'accepted') {
    if (ride.driverId?.toString() !== UserId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'You are not the driver of this ride.',
      );
    }
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot cancel a ride that you have accepted. Only the rider can cancel an accepted ride.',
    );
  }

  // 3. Prepare our dynamic update payload
  const updateData: Record<string, string> = { status };

  // 4. Handle Driver Acceptance Assignment Logic
  if (status === 'accepted') {
    // If a driver is accepting it, ensure no one else got to it first
    if (ride.driverId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'This ride request has already been accepted by another driver.',
      );
    }

    if (ride.driverId?.toString() === UserId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'You have already accepted this ride request.',
      );
    }

    // Only assign the driverId if a DRIVER is the one making the request
    if (UserRole === Role.DRIVER) {
      updateData.driverId = UserId;
    }
  }

  // 5. Update the database document
  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );

  // .populate('driverId', 'fullName phoneNumber driverProfile.vehicleDetails');

  // Populating allows you to easily return driver data back to the mobile app or client

  return updatedRide;
};

export const rideService = {
  createRideService,
  getFareQuoteService,
  cancelRideService,
  updateRideStatus,
  getAllRiders,
  getRiderHistory,
};
