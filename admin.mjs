import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Database, Resource, getModelByName  } from '@adminjs/prisma';

AdminJS.registerAdapter({ Database, Resource });

const prisma = new PrismaClient();

const app = express();

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
app.use(adminJs.options.rootPath, adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AdminJS доступен по адресу http://localhost:${PORT}/admin`);
});