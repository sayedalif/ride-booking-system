/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log('Connected To DB!!');

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received, Shutting down the server...');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  // if no server is detected, but SIGTERM occurs then also shut down the server
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received, Shutting down the server...');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  // if no server is detected, but SIGINT occurs then also shut down the server
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection Error! Shutting down the server...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  // if no server is detected, but some unhandled rejection occurs then also shut down the server
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.log('Uncaught Exception Error! Shutting down the server...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  // if no server is detected, but some uncaught exception occurs then also shut down the server
  process.exit(1);
});
