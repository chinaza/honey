import { NextFunction, Request, Response } from 'express';
import { getKnex } from '../utils/db';
import { QueryControllerParams } from '../interfaces/crud';

export function queryController({
  db,
  query,
  processErrorResponse,
  processResponseData
}: QueryControllerParams) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const paginate =
        limit || page ? { page: page || 1, limit: limit || 10 } : undefined;

      const knex = getKnex();
      let queryBuilder = query(knex, req);
      if (paginate) {
        queryBuilder = queryBuilder
          .limit(paginate.limit)
          .offset(paginate.limit * (paginate.page - 1));
      }
      const { sql, bindings } = queryBuilder.toSQL();

      const result = await db.query(sql, [...bindings]);

      const data = processResponseData
        ? await processResponseData(result, req)
        : result;

      res.send({ data });
      next({ data });
    } catch (e) {
      if (processErrorResponse) {
        return next(processErrorResponse(e as Error));
      }
      return next(e);
    }
  };
}
