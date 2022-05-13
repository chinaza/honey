import { Sequelize } from 'sequelize';

export interface DBOptions {
  host: string;
  port: number | string;
  user: string;
  password: string;
  database: string;
}

export default async function initDB(options: string | DBOptions) {
  let uri = '';
  if (typeof options === 'string') {
    uri = options;
  } else {
    uri = `postgres://${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;
  }
  const sequelize = new Sequelize(uri);

  await sequelize.authenticate();
  console.error('DB Connection established successfully');

  return sequelize;
}
