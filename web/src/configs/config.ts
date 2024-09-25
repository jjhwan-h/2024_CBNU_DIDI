import {Dialect, Options} from "sequelize/types";
import dotenv from 'dotenv';
dotenv.config();

export const development: Options = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  dialect: process.env.DB_DIALECT as Dialect
};

export const test: Options = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  dialect: process.env.DB_DIALECT as Dialect
};

export const production: Options = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  dialect: process.env.DB_DIALECT as Dialect
};
