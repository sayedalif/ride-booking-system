/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import { DriverServices } from './driver.service';

const getAllDrivers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await DriverServices.getAllDrivers();
    sendResponse(res, {
      success: true,
      message: 'All Drivers are retrieved successfully',
      statusCode: StatusCodes.CREATED,
      data: result.data,
      meta: result.meta,
    });
  },
);

const updateDriverApproval = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the target user's ID from /drivers/approve/:id
    const { id: driverId } = req.params;

    // Execute business validation and approval update
    const result = await DriverServices.approveDriver(driverId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Driver application approved successfully. User role upgraded to DRIVER.',
      data: result,
    });
  },
);

const updateOnlineStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extracted from your checkAuth token middleware
    const userId = (req.user as JwtPayload).userId;

    // Extracted securely from your request body via Zod validation
    const { isOnline } = req.body;

    const result = await DriverServices.updateOnlineStatus(userId, isOnline);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Driver status shifted to ${isOnline ? 'ONLINE' : 'OFFLINE'} successfully.`,
      data: result,
    });
  } catch (error) {
    next(error); // Pipe errors safely into the global error handler
  }
};

const getMyEarnings = catchAsync(async (req: Request, res: Response) => {
  // Extract the driver's ID securely from the token payload
  const driverId = (req.user as JwtPayload).userId;

  const result = await DriverServices.getDriverEarnings(driverId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Driver earnings statistics retrieved successfully',
    data: result,
  });
});

export const DriverController = {
  getAllDrivers,
  updateDriverApproval,
  updateOnlineStatus,
  getMyEarnings,
};
