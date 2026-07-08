export const FARE_CONFIG = {
  bike: { baseFare: 20, perKm: 8, perMin: 0.5, minFare: 30 },
  car: { baseFare: 50, perKm: 15, perMin: 1.5, minFare: 80 },
} as const;

export type RideType = keyof typeof FARE_CONFIG;

interface FareInput {
  distanceKm: number;
  durationMin?: number; // optional for now, default estimate
  rideType: RideType;
}

export function calculateFare({
  distanceKm,
  durationMin,
  rideType,
}: FareInput): number {
  const rates = FARE_CONFIG[rideType];

  // rough duration estimate if not provided: assume avg speed
  const avgSpeedKmh = rideType === 'bike' ? 30 : 25;
  const estimatedDuration = durationMin ?? (distanceKm / avgSpeedKmh) * 60;

  const fare =
    rates.baseFare +
    distanceKm * rates.perKm +
    estimatedDuration * rates.perMin;

  return Math.max(Math.round(fare), rates.minFare);
}
