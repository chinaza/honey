import { deleteByIdControllerParams } from '../interfaces/crud';
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
}: deleteByIdControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
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
