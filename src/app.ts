import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import './config';
import './jobs';
import router from './routes';
import HttpError from './utils/http';

const app = express();

app.use(logger('dev'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes setup
app.use(router);

app.use((_, res) => {
  const err = new HttpError('Endpoint does not exist', 404);

  return res.status(err.status).json({ message: err.message });
});

// error handler
app.use((err: any, req, res: any) => {
  return res
    .status(err.status || 500)
    .send({ message: 'Something went wrong' });
});

export default app;
