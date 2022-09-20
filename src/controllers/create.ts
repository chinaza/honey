import { ICreate } from '@src/interfaces/crud';
import Postgres from '@src/services/postgres';
import HttpError, { handleHttpError } from '@src/utils/error';
import { extractInsertData } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export default function createController(
  postgres: Postgres,
  resource: string,
  params: ICreate['params'],
  message: string
): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = extractInsertData(req.body, params);

      await postgres.create(resource, body);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
