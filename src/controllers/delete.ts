import Postgres from '@src/services/postgres';
import HttpError, { handleHttpError } from '@src/utils/error';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function deleteByIdController(
  postgres: Postgres,
  resource: string,
  message: string
): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      await postgres.delete(resource, {
        id: {
          value: id,
          operator: '='
        }
      });

      res.send({ message });
      next({ message });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
