import path from 'path';
import dotenv from 'dotenv';
import EventEmitter from 'events';
import initDB, { DBOptions } from './database';
import { Sequelize } from 'sequelize/types';
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

class Config {
  private _db: Sequelize = null!;
  private dbState: 'init' | 'loading' | 'loaded' | 'failed' = 'init';

  public getEnv = (key: string) => {
    return process.env[key];
  };

  private _dbOptions: DBOptions | string = '';
  private eventEmitter = new EventEmitter();

  get dbOptions() {
    return this._dbOptions;
  }
  set dbOptions(options: DBOptions | string) {
    this._dbOptions =
      typeof options === 'string'
        ? options
        : {
            host: this.getEnv('DB_HOST') || options!.host,
            port: this.getEnv('DB_PORT') || options!.port,
            user: this.getEnv('DB_USER') || options!.user,
            password: this.getEnv('DB_PASSWORD') || options!.password,
            database: this.getEnv('DB_DATABASE') || options!.database
          };
  }

  get isLive() {
    return process.env.NODE_ENV === 'production';
  }

  get db() {
    return this._db;
  }
  set db(instance: Sequelize) {
    this._db = instance;
  }

  public async setupDB(): Promise<Sequelize | null> {
    try {
      if (this.db) return this.db;

      const EVENT_NAME = 'DB_SETUP';
      if (this.dbState === 'loading') {
        return new Promise((resolve) => {
          this.eventEmitter.once(EVENT_NAME, () => {
            return resolve(this.db);
          });
          setTimeout(() => resolve(null), 4000);
        });
      }

      this.dbState = 'loading';
      this.db = await initDB(this.dbOptions);
      this.eventEmitter.emit(EVENT_NAME, true);
      this.dbState = 'loaded';
      return this.db;
    } catch (error: any) {
      this.dbState = 'failed';
      console.error('DB Connection Failed:', error.message || error);
      return null;
    }
  }
}

export default new Config();
