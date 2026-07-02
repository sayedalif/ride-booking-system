/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export const validateRequest =
  (zodSchema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('old request body:', req.body);
      req.body = await zodSchema.parseAsync(req.body);
      console.log('new body:', req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
