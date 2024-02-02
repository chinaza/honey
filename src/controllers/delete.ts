import { deleteByIdControllerParams } from '@src/interfaces/crud';
import HttpError, { handleHttpError } from '@src/utils/error';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function deleteByIdController({
  db,
  resource,
  message,
  idField = 'id'
}: deleteByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params[idField || 'id'];

      await db.delete(resource, {
        [idField]: {
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
