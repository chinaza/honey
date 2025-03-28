import {
  GetByIdControllerParams,
  GetByQueryControllerParams
} from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { formatReadFilter } from '../utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function getByIdController({
  db,
  resource,
  fields,
  idField = 'id',
  processResponseData,
  processErrorResponse,
  filterQuery = {}
}: GetByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const filter = filterQuery && formatReadFilter(req.query, filterQuery);

      const data = await db.read(resource, fields, {
        [idField]: {
          value: id,
          operator: '='
        },
        ...filter
      });

      if (!data?.length) {
        throw new HttpError('Record does not exist', 404);
      }

      res.send({
        data: processResponseData
          ? await processResponseData(data[0], req)
          : data[0]
      });
      next({ data });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}

export function getByQueryController({
  db,
  resource,
  fields,
  filterQuery,
  format,
  processResponseData,
  processErrorResponse
}: GetByQueryControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const paginate = page && limit ? { page, limit } : undefined;

      const filter = filterQuery && formatReadFilter(req.query, filterQuery);

      let data: Record<string, any>[] = await db.read(
        resource,
        fields,
        filter,
        paginate,
        format
      );
      let total = 0;
      if (paginate) {
        total = Number(data[0]?.['honey_total_count'] || 0);
        data = data.map((item: Record<string, any>) => {
          delete item['honey_total_count'];
          return item;
        });
      }

      if (processResponseData) {
        data = await processResponseData(data, req);
      } else if (!data?.length) {
        throw new HttpError('No records found', 404);
      }
      const response = {
        data,
        meta: {
          ...(!!paginate && {
            pagination: {
              total,
              pageSize: limit,
              page,
              pageCount: Math.ceil(total / limit)
            }
          })
        }
      };
      res.send(response);
      next(response);
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
