import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import http from 'http';
import expressOasGenerator from 'express-oas-generator';
import '../config';
import HttpError from '../utils/error';
import { AddressInfo } from 'net';
import { Metadata } from '@src/interfaces/express';

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
  private fallbackErrMessage = 'Endpoint does not exist';
  private routePrefix = '/api';

  constructor(
    port: string | number,
    private metadata?: Metadata
  ) {
    this.fallbackErrMessage =
      this.metadata?.fallbackErrorMessage || this.fallbackErrMessage;
    this.routePrefix = this.metadata?.routePrefix || this.routePrefix;
    this.initMiddlewares();
    this.setupErrorFallback();
    this.app.set('port', port);
  }

  public listen() {
    expressOasGenerator.handleRequests();
    const port = Number(this.app.get('port'));
    const server = this.app.listen(port);
    server.on('error', onError(port));
    server.on('listening', onListening(server));
  }

  private initMiddlewares() {
    const corsOptions: cors.CorsOptions = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: '*',
      exposedHeaders: '*',
      credentials: true,
      optionsSuccessStatus: 204
    };

    expressOasGenerator.handleResponses(this.app, {} as any);
    this.app.use(logger('dev'));
    this.app.use(cors(corsOptions));
    this.app.use(
      express.json({
        verify(req: any, _res, buf) {
          req.rawBody = buf;
        }
      })
    );
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(this.routePrefix, this.appRoutes);
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
