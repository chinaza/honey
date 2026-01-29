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
  filterQuery = {},
  joins
}: GetByIdControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const filter = formatReadFilter(req.query, filterQuery, req);

      let data = await db.read(
        resource,
        fields,
        {
          [idField]: {
            value: id,
            operator: '='
          },
          ...filter
        },
        undefined,
        undefined,
        joins
      );

      if (!data?.length) {
        throw new HttpError('Record does not exist', 404);
      }

      data = processResponseData
        ? await processResponseData(data[0], req)
        : data[0];

      res.send({
        data
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
  processErrorResponse,
  joins
}: GetByQueryControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const paginate =
        limit || page ? { page: page || 1, limit: limit || 10 } : undefined;

      const filter =
        filterQuery && formatReadFilter(req.query, filterQuery, req);

      let data: Record<string, any>[] = await db.read(
        resource,
        fields,
        filter,
        paginate,
        format,
        joins
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
