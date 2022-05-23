import Postgres from '@src/services/postgres';
import { Filter } from '@src/shared/interface';
import HttpError, { handleHttpError } from '@src/utils/error';
import { generateUpdateData } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function updateByIdController(
  postgres: Postgres,
  resource: string,
  params: Record<string, 'replace' | 'inc' | 'dec'>,
  message: string
): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateUpdateData(req.body, params);
      const filter: Filter = {
        id: {
          operator: '=',
          value: req.params.id
        }
      };

      await postgres.update(resource, body, filter);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
