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
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    placeName: String, // Optional: "Home", "Office", etc.
  },
  { _id: false }
);

// Add geospatial index for location queries
locationSchema.index({ coordinates: '2dsphere' });

// models/RideRequest.js
const rideSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    enum: ['economy', 'premium', 'xl'],
    default: 'economy',
  },
  scheduledTime: Date, // For future rides
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Ride = mongoose.model('Ride', rideSchema);
