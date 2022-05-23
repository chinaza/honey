import path from 'path';
import dotenv from 'dotenv';
import initDB, { DBOptions } from './database';
import { Sequelize } from 'sequelize/types';
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

class Config {
  private _db: Sequelize = null!;

  public getEnv = (key: string) => {
    return process.env[key];
  };

  get isLive() {
    return process.env.NODE_ENV === 'production';
  }

  get db() {
    return this._db;
  }
  set db(instance: Sequelize) {
    this._db = instance;
  }

  public async setupDB(options?: DBOptions | string) {
    try {
      const dbOptions =
        typeof options === 'string'
          ? options
          : {
              host: this.getEnv('DB_HOST') || options!.host,
              port: this.getEnv('DB_PORT') || options!.port,
              user: this.getEnv('DB_USER') || options!.user,
              password: this.getEnv('DB_PASSWORD') || options!.password,
              database: this.getEnv('DB_DATABASE') || options!.database
            };
      this.db = await initDB(dbOptions);
      return this.db;
    } catch (error: any) {
      console.error('DB Connection Failed:', error.message || error);
    }
  }
}

export default new Config();
