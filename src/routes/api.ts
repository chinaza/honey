import express from 'express';
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => res.send('Welcome to API'));

export default apiRouter;
