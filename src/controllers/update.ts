import {
  UpdateByIdControllerParams,
  UpdateControllerParams
} from '../interfaces/crud';
import { Filter } from '../shared/interface';
import HttpError, { handleHttpError } from '../utils/error';
import { formatReadFilter, generateUpdateData } from '../utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function updateByIdController({
  db,
  resource,
  params,
  message,
  idField = 'id',
  processErrorResponse,
  processResponseData,
  filterQuery = {}
}: UpdateByIdControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const body = generateUpdateData(req.body, params);
      const additionalFilter =
        filterQuery && formatReadFilter(req.body, filterQuery, req);
      const filter: Filter = {
        [idField]: {
          operator: '=',
          value: req.params.id
        },
        ...additionalFilter
      };

      const result = await db.update(resource, body, filter);

      const data = processResponseData
        ? await processResponseData(result, req)
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

export function updateController({
  db,
  resource,
  params,
  message,
  filterQuery,
  processErrorResponse,
  processResponseData
}: UpdateControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const body = generateUpdateData(req.body, params);
      const filter =
        filterQuery && formatReadFilter(req.body, filterQuery, req);

      const result = await db.update(resource, body, filter);

      const data = processResponseData
        ? await processResponseData(result, req)
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
