import { Sequelize } from 'sequelize';

export interface DBOptions {
  host: string;
  port: number | string;
  user: string;
  password: string;
  database: string;
}

export default function initDB(options: string | DBOptions) {
  let uri = '';
  if (typeof options === 'string') {
    uri = options;
  } else {
    uri = `postgres://${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;
  }
  const sequelize = new Sequelize(uri, {
    logging: false
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log('DB Connection established successfully');
    })
    .catch((err) => {
      console.log('DB Connection failed');
      console.error(err);
    });

  return sequelize;
}
