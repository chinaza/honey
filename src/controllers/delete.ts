import {
  DeleteByIdControllerParams,
  DeleteControllerParams
} from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';
import { formatReadFilter } from '../utils/formatter';

export function deleteByIdController({
  db,
  resource,
  message,
  idField = 'id',
  processErrorResponse,
  filterQuery = {}
}: DeleteByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params[idField || 'id'];
      const filter =
        filterQuery && formatReadFilter(req.body, filterQuery, req);

      await db.delete(resource, {
        [idField]: {
          value: id,
          operator: '='
        },
        ...filter
      });

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

export function deleteController({
  db,
  resource,
  message,
  processErrorResponse,
  filterQuery
}: DeleteControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = filterQuery && formatReadFilter(req.body, filterQuery);

      await db.delete(resource, filter);

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
