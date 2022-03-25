import express from 'express';
import path from 'path';
import apiRouter from './api';
import docsRouter from './docs';
const router = express.Router();

router.use('/api', apiRouter);
router.use('/docs', docsRouter);

router.use(express.static(path.join(__dirname, '../public')));

router.get('/', (req, res) => {
  return res.send('Hello World!');
});

export default router;
