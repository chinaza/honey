import { BulkCreateControllerParams } from '../interfaces/crud';
import HttpError, { handleHttpError } from '../utils/error';
import { extractInsertData } from '../utils/formatter';
import { NextFunction, Request, Response } from 'express';
import { Controller } from './interfaces';

export default function bulkCreateController({
  db,
  resource,
  params,
  message,
  processResponseData,
  processErrorResponse
}: BulkCreateControllerParams): Controller {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!Array.isArray(req.body))
        throw new HttpError('Invalid body data. Array expected', 422);

      const bodies = (req.body as Record<string, unknown>[]).map((item) =>
        extractInsertData(item, params)
      );

      const data = await db.bulkCreate(resource, bodies);
      const ids = data.map((row) => row.id);

      const responseData = processResponseData
        ? await processResponseData({ ids }, req)
        : { ids };

      res.send({
        message,
        data: responseData
      });
      next({ message, data: responseData });
    } catch (error: any) {
      if (processErrorResponse) {
        error = processErrorResponse(error);
      }
      handleHttpError(error as HttpError, res);
      next({ ...error, isError: true });
    }
  };
}
