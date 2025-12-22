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
      // Support both async and non-async query functions
      let queryBuilder = await query(knex, req);
      if (paginate) {
        queryBuilder = queryBuilder
          .limit(paginate.limit)
          .offset(paginate.limit * (paginate.page - 1));
      }
      const { sql, bindings } = queryBuilder.toSQL();

      const result = await db.query(sql, [...bindings]);

      if (processResponseData) {
        return res.send({ data: processResponseData(result, req) });
      }

      return res.send({ data: result });
    } catch (e) {
      if (processErrorResponse) {
        return next(processErrorResponse(e as Error));
      }
      return next(e);
    }
  };
}
