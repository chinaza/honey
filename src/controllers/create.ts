import { CreateControllerParams } from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { extractInsertData } from '../utils/formatter';
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
  return async function (req: Request, res: Response, next: NextFunction) {
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
