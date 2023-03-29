import {
  GetByIdControllerParams,
  GetByQueryControllerParams
} from '@src/interfaces/crud';
import HttpError, { handleHttpError } from '@src/utils/error';
import { formatReadFilter } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function getByIdController({
  db,
  resource,
  fields,
  idField = 'id',
  processResponseData
}: GetByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const data = await db.read(resource, fields, {
        [idField]: {
          value: id,
          operator: '='
        }
      });

      if (!data?.length) {
        throw new HttpError('Record does not exist', 404);
      }

      res.send({
        data: processResponseData ? processResponseData(data[0]) : data[0]
      });
      next({ data });
    } catch (error: any) {
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
  processResponseData
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

      if (!data?.length) {
        throw new HttpError('No records found', 404);
      }
      const response = {
        data: processResponseData ? processResponseData(data) : data,
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
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
