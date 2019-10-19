import { Router } from 'express';

import SessionControler from './app/controllers/SessionController';
import StudentControler from './app/controllers/StudentController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

routes.post('/sessions', SessionControler.store);

routes.use(authMiddleware);

routes.post('/students', StudentControler.store);
routes.put('/students', StudentControler.update);

export default routes;
