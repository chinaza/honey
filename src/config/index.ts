import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const _retrieveConfig = (key: string) => {
  return process.env[key];
};

const _isLive = () => {
  return process.env.NODE_ENV === 'production';
};

class Config {
  public getEnv = (key: string) => {
    return _retrieveConfig(key);
  };

  get isLive() {
    return _isLive();
  }
}

export default new Config();
