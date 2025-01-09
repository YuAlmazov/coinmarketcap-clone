import express from 'express';
import next from 'next';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { PrismaClient } from '@prisma/client';
import { Database, Resource, getModelByName } from '@adminjs/prisma';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

AdminJS.registerAdapter({ Database, Resource });

const prisma = new PrismaClient();

const startServer = async () => {
  await app.prepare();
  const server = express();

  // Настройка AdminJS
  const adminJs = new AdminJS({
    resources: [
      {
        resource: { model: getModelByName('User'), client: prisma },
        options: { properties: { password: { isVisible: false } } },
      },
    ],
    rootPath: '/admin',
  });

  const adminRouter = AdminJSExpress.buildRouter(adminJs);
  server.use(adminJs.options.rootPath, adminRouter);

  // Обработка всех остальных запросов Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Сервер запущен на http://localhost:${PORT}`);
    console.log(`> AdminJS доступен по адресу http://localhost:${PORT}/admin`);
  });
};

startServer().catch((err) => {
  console.error('Ошибка при запуске сервера:', err);
  process.exit(1);
});
