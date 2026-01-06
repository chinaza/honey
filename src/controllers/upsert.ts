import {
  UpsertByIdControllerParams,
  UpsertControllerParams
} from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { generateUpdateData } from '../utils/formatter';
import { NextFunction, Response } from 'express';
import { Request } from '../interfaces/express';
import { Controller } from './interfaces';

export function upsertByIdController({
  db,
  resource,
  params,
  message,
  idField = 'id',
  processErrorResponse,
  processResponseData
}: UpsertByIdControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body[idField] = req.params.id;
      params = { ...params, [idField]: 'replace' };
      const body = generateUpdateData(req.body, params);

      const result = await db.upsert(resource, body, [idField]);

      if (result?.[0]) {
        req.isInsert = (result[0] as any).is_insert;
      }

      const data = processResponseData
        ? await processResponseData(result?.[0], req)
        : undefined;

      res.send({ message, data });

      next({ message, data });
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
  processErrorResponse,
  processResponseData
}: UpsertControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const body = generateUpdateData(req.body, params);

      const result = await db.upsert(resource, body, conflictTarget);

      if (result?.[0]) {
        req.isInsert = (result[0] as any).is_insert;
      }

      const data = processResponseData
        ? await processResponseData(result?.[0], req)
        : undefined;

      res.send({ message, data });

      next({ message, data });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
