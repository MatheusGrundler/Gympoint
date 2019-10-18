import { Router } from 'express';

import SessionControler from './app/controllers/SessionController';

const routes = new Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

routes.post('/sessions', SessionControler.store);

export default routes;
