import express, { NextFunction, Request, Response } from 'express';
const docsRouter = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(
  path.join(`${__dirname}/../docs/documentation.yml`)
);

docsRouter.use(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    swaggerDocument.host = req.get('host');
    req.swaggerDoc = swaggerDocument;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

export default docsRouter;
