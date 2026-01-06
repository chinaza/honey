import { NextFunction, Request as ExpressRequest, Response } from 'express';

export interface Request extends ExpressRequest {
  isInsert?: boolean;
}

export interface Metadata {
  fallbackErrorMessage?: string;
  routePrefix?: string;
}

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type ExitMiddleware = (
  data: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export type { Response };
