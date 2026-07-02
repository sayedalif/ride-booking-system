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

    //   res
    //     .status(StatusCodes.CREATED)
    //     .json({ success: true, message: 'user created successfully', user });
    // }

    sendResponse(res, {
      success: true,
      message: 'user created successfully',
      statusCode: StatusCodes.CREATED,
      data: user,
    });
  }
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
  }
);

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
  }
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

export const UserController = {
  createUser,
  getAllUsers,
  updateUser,
  // updateApproveUser,
  // updateUserApproval,
};
