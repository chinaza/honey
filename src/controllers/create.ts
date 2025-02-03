import { CreateControllerParams } from '@src/interfaces/crud';
import HttpError, { handleHttpError } from '@src/utils/error';
import { extractInsertData } from '@src/utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export default function createController({
  db,
  resource,
  params,
  message,
  processResponseData,
  processErrorResponse
}: CreateControllerParams): Controller {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = extractInsertData(req.body, params);

      const data = await db.create(resource, body);
      const id = data[0].id;

      res.send({
        message,
        data:
          req.body.dataOverride ||
          (processResponseData
            ? await processResponseData({ id }, req)
            : { id })
      });
      next({ message, data: { id } });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
