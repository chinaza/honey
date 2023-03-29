import { UpdateByIdControllerParams } from '@src/interfaces/crud';
import { Filter } from '@src/shared/interface';
import HttpError, { handleHttpError } from '@src/utils/error';
import { generateUpdateData } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function updateByIdController({
  db,
  resource,
  params,
  message,
  idField = 'id'
}: UpdateByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateUpdateData(req.body, params);
      const filter: Filter = {
        [idField]: {
          operator: '=',
          value: req.params.id
        }
      };

      await db.update(resource, body, filter);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
