/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { DriverServices } from './driver.service';

const createDriver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driver = await DriverServices.createDriver(req.body);

    //   res
    //     .status(StatusCodes.CREATED)
    //     .json({ success: true, message: 'user created successfully', user });
    // }

    sendResponse(res, {
      success: true,
      message: 'Driver Created Successfully',
      statusCode: StatusCodes.CREATED,
      data: driver,
    });
  }
);

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
  }
);

const updateDriver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;

    const verifiedToken = req.user as JwtPayload;

    const payload = req.body;
    const user = await DriverServices.updateDriver(
      userId,
      payload,
      verifiedToken
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  }
);

export const DriverController = {
  createDriver,
  getAllDrivers,
  updateDriver,
};
