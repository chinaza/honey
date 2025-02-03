import {
  UpsertByIdControllerParams,
  UpsertControllerParams
} from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { generateUpdateData } from '../utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function upsertByIdController({
  db,
  resource,
  params,
  message,
  idField = 'id',
  processErrorResponse
}: UpsertByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body[idField] = req.params.id;
      params = { ...params, [idField]: 'replace' };
      const body = generateUpdateData(req.body, params);

      await db.upsert(resource, body, [idField]);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}

export function upsertController({
  db,
  resource,
  params,
  message,
  conflictTarget,
  processErrorResponse
}: UpsertControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateUpdateData(req.body, params);

      await db.upsert(resource, body, conflictTarget);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
