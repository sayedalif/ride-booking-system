import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { rideService } from './ride.service';
import { StatusCodes } from 'http-status-codes';

const createRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedUser = req.user as JwtPayload;
    const riderId = decodedUser.userId;

    const { pickupAddress, destinationAddress, distanceKm, rideType } =
      req.body;

    const ride = await rideService.createRideService({
      riderId,
      pickupAddress,
      destinationAddress,
      distanceKm,
      rideType,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Ride created successfully',
      data: ride,
    });
  },
);

// Existing createRide controller remains here...

const getFareQuote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distanceKm, rideType } = req.body;

    const quoteData = await rideService.getFareQuoteService({
      distanceKm,
      rideType,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Fare quote calculated successfully',
      data: quoteData,
    });
  },
);

const cancelRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedUser = req.user as JwtPayload;
    const riderId = decodedUser.userId;
    const { rideId } = req.params;

    const updatedRide = await rideService.cancelRideService(rideId, riderId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Ride cancelled successfully',
      data: updatedRide,
    });
  },
);

const getAllRiders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await rideService.getAllRiders();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'All riders retrieved successfully',
      data: result,
    });
  },
);

const getRiderHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extracted securely by your auth token middleware
    const riderId = (req?.user as JwtPayload).userId;

    // Fetch the target history matching the authenticated rider
    const result = await rideService.getRiderHistory(riderId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Rider history retrieved successfully',
      data: result,
    });
  },
);

const updateRideStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: rideId } = req.params;
    const { status } = req.body; // Validated via updateRideStatusZodSchema

    // Extract the identity of the person making the API call
    // (Adjust paths depending on exactly how your checkAuth maps the token details)
    const decodedUser = req.user as JwtPayload;
    console.log("🚀 ~ decodedUser:", decodedUser);
    
    const UserId = decodedUser.userId;
    const UserRole = decodedUser.role;

    // Execute status transition with assignment tracking
    const result = await rideService.updateRideStatus(
      rideId,
      status,
      UserId,
      UserRole,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Ride status updated successfully',
      data: result,
    });
  },
);

export const rideController = {
  createRide,
  getFareQuote,
  cancelRide,
  getAllRiders,
  getRiderHistory,
  updateRideStatus,
};
