import { UpdateByIdControllerParams } from '@src/interfaces/crud';
import HttpError, { handleHttpError } from '@src/utils/error';
import { generateUpdateData } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export function upsertByIdController({
  db,
  resource,
  params,
  message,
  idField = 'id'
}: UpdateByIdControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateUpdateData(req.body, params);

      await db.upsert(resource, body, idField);

      res.send({ message });
      next({ message });
    } catch (error: any) {
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
