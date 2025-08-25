import express, { Request, Response } from 'express';
const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Ride Booking System Server is running' });
});

export default app;
