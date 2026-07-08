import mongoose from 'mongoose';

// models/Location.js - Embedded schema for locations
const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    address: {
      type: String,
    },
    placeName: String, // Optional: "Home", "Office", etc.
  },
  { _id: false },
);

// Add geospatial index for location queries
locationSchema.index({ coordinates: '2dsphere' });

// models/RideRequest.js
const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Starts as null when status is 'pending'
    },
    pickup: {
      type: locationSchema,
      required: true,
    },
    destination: {
      type: locationSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    estimatedDistance: Number, // in kilometers
    estimatedDuration: Number, // in minutes
    estimatedFare: Number,
    rideType: {
      type: String,
      enum: ['bike', 'car'],
      required: true,
    },
    scheduledTime: Date, // For future rides
  },
  { timestamps: true },
);

export const Ride = mongoose.model('Ride', rideSchema);
