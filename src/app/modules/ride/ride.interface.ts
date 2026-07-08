export interface CreateRidePayload {
  riderId: string;
  pickupAddress: string;
  destinationAddress: string;
  distanceKm: number;
  rideType: 'bike' | 'car';
}