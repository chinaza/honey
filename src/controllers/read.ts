import Postgres from '@src/services/postgres';
import HttpError, { handleHttpError } from '@src/utils/error';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function getByIdController(
  postgres: Postgres,
  resource: string,
  fields: string[]
): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const data = await postgres.read(resource, fields, {
        id: {
          value: id,
          operator: '='
        }
      });

      if (!data?.length) {
        throw new HttpError('Record does not exist', 404);
      }

      res.send({ data: data[0] });
      next({ data });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
