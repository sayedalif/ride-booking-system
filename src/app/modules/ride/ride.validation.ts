import { z } from 'zod';

// const rideTypeEnum = z.enum(['bike', 'car']);

const locationSchema = z.object({
  address: z
    .string({ error: 'Address is required' })
    .trim()
    .min(1, 'Address cannot be empty'),
  placeName: z.string().trim().optional(),
  coordinates: z
    .tuple([z.number(), z.number()]) // [longitude, latitude]
    .optional(),
});

export const createRideZodSchema = z.object({
  pickup: locationSchema,

  destination: locationSchema,

  distanceKm: z
    .number({
      // error: 'Distance is required',
      message: 'Distance must be a number',
    })
    .positive('Distance must be greater than 0')
    .max(1000, 'Distance seems unrealistic'), // sanity ceiling, adjust as needed

  rideType: z.enum(['bike', 'car'], {
  error: 'Ride type is required',
  // invalid_type_error: 'Ride type must be either bike or car',
}),

  scheduledTime: z
    .string()
    .datetime({ message: 'scheduledTime must be a valid ISO date string' })
    .optional(),
});

export const getFareQuoteZodSchema = z.object({
  distanceKm: z
    .number({
      error: 'Distance is required',
      // message: 'Distance must be a number',
    })
    .positive('Distance must be greater than 0')
    .max(1000, 'Distance seems unrealistic'),

  rideType: z.enum(['bike', 'car'], {
  error: 'Ride type is required',
  // invalid_type_error: 'Ride type must be either bike or car',
}),
});

export const updateRideStatusZodSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], {
    error: 'Status is required',
  }),
});