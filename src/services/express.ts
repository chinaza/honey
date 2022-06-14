import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';
import cors from 'cors';
import http from 'http';
import '../config';
import HttpError from '../utils/error';
import { AddressInfo } from 'net';

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => NextFunction;

interface Metadata {
  fallbackErrorMessage?: string;
  routePrefix?: string;
}

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (port: string | number) => {
  return (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
      default:
        throw error;
    }
  };
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = (server: http.Server) => {
  return () => {
    const addr = server.address();
    const bind =
      typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${(addr as AddressInfo).port}`;
    console.log(
      `%c Honey Server started on ${bind} `,
      'background: #222; color: #bada55; font-size: 32px'
    );
  };
};

class ExpressApp {
  public app = express();
  public appRoutes = express.Router();
  private server: http.Server;
  private fallbackErrMessage = 'Endpoint does not exist';
  private routePrefix = '/';

  constructor(port: string | number, private metadata?: Metadata) {
    this.initMiddlewares();
    this.setupErrorFallback();
    this.app.set('port', port);
    this.server = http.createServer(this.app);
    this.server.on('error', onError(port));
    this.server.on('listening', onListening(this.server));
    this.fallbackErrMessage =
      this.metadata?.fallbackErrorMessage || this.fallbackErrMessage;
    this.routePrefix = this.metadata?.routePrefix || this.routePrefix;
  }

  public listen() {
    this.server.listen(this.app.get('port'));
  }

  private initMiddlewares() {
    this.app.use(logger('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(this.routePrefix, this.appRoutes);
    this.app.use((_, res) => {
      const err = new HttpError(this.fallbackErrMessage, 404);

      return res.status(err.status).json({ message: err.message });
    });
  }

  private setupErrorFallback() {
    this.app.use((_, res) => {
      const err = new HttpError(this.fallbackErrMessage, 404);

      return res.status(err.status).json({ message: err.message });
    });
    // error handler
    this.app.use((err: any, _, res: any) => {
      return res
        .status(err.status || 500)
        .send({ message: 'Something went wrong' });
    });
  }
}

export default ExpressApp;
