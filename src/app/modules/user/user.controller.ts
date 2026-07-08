/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserServices } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      message: 'user created successfully',
      statusCode: StatusCodes.CREATED,
      data: user,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();
    sendResponse(res, {
      success: true,
      message: 'All Users Retrieved Successfully',
      statusCode: StatusCodes.OK,
      data: result.data,
      meta: result.meta,
    });
  },
);

const applyForDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extracted by your authentication middleware (e.g., verifyAuth / verifyJWT)
    // Adjust the property path if your middleware stores it under req.user.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req.user as any).userId;

    // Extract the validated request body
    const driverApplicationData = req.body;

    // Invoke the business logic layer
    const result = await UserServices.applyForDriver(
      userId,
      driverApplicationData,
    );

    // Return a standardized response format
    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        'Driver application submitted successfully. It is now pending review.',
      data: result,
    });
  } catch (error) {
    // Pass errors directly to your Express global error handler
    next(error);
  }
};

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;

    const verifiedToken = req.user as JwtPayload;

    const payload = req.body;
    const user = await UserServices.updateUser(userId, payload, verifiedToken);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  },
);

// const updateApproveUser = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.params.id;
//     // const token = req.headers.authorization;
//     // const verifiedToken = verifyToken(
//     //   token as string,
//     //   envVars.JWT_ACCESS_SECRET
//     // ) as JwtPayload;

//     const verifiedToken = req.user as JwtPayload;

//     const payload = req.body;
//     const user = await UserServices.updateUser(userId, payload, verifiedToken);

//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       success: true,
//       message: 'User updated successfully',
//       data: user,
//     });
//   }
// );

/* const updateUserApproval = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;

    const verifiedToken = req.user as JwtPayload;

    const payload = req.body;
    const user = await UserServices.updateUserApproval(userId, payload, verifiedToken);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  }
); */

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id: targetUserId } = req.params;
  const payload = req.body;

  const result = await UserServices.updateUserAdministrativeStatus(
    targetUserId,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User administrative status updated successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  updateUser,
  // updateApproveUser,
  // updateUserApproval,
  applyForDriver,
  updateUserStatus,
};
