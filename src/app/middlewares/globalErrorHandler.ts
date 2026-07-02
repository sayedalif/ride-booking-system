/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { handlerDuplicateError } from '../helpers/handleDuplicateError';
import { handleCastError } from '../helpers/handleCastError';
import { handleZodError } from '../helpers/handleZodError';
import { handleValidationError } from '../helpers/handleValidationError';

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (envVars.NODE_ENV === 'development') {
  console.log(err);
  }

  let errorSources: any = [];
  let statusCode = 500;
  let message = `something went wrong!! ${err.message}`;

  // this is for custom error handling
  // this makes sure err uses the passed status code and message of the AppError class

  // duplicate error
  if (err.code === 11000) {
    const simplifiedError = handlerDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }
  // Mongoose Cast error
  else if (err.name === 'CastError') {
    const simplifiedCastError = handleCastError(err);
    statusCode = simplifiedCastError.statusCode;
    message = simplifiedCastError.message;
  } else if (err.name === 'ZodError') {
    const simplifiedZodError = handleZodError(err);
    statusCode = simplifiedZodError.statusCode;
    errorSources = simplifiedZodError.errorSources;
    message = simplifiedZodError.message;
  } else if (err.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);

    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources;
    message = simplifiedError.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === 'development' ? err : undefined,
    stack: envVars.NODE_ENV === 'development' ? err.stack : null,
  });
}
