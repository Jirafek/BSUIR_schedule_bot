import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';

dotenv.config();

sqlite3.verbose();

import {startHandler} from './src/handlers/startHandler.js';
import {callBackHandler} from './src/handlers/callBackHandler.js';
import {menu} from "./src/handlers/menu.js";

const telegramBotToken = process.env.TELEGRAM_BOT_API;
const port = process.env.PORT;

export const db = new sqlite3.Database('users.db');

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER,
      username TEXT,
      salt TEXT,
      hashedPassword TEXT,
      token TEXT,
      userGroup INTEGER
    )
  `);
});

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const bot = new TelegramBot(telegramBotToken, {polling: true});

bot.onText(/\/start/, async (msg) => await startHandler(bot, msg));
bot.onText(/\/menu/, async (msg) => await menu(bot, msg));

bot.on('callback_query', async (query) => await callBackHandler(bot, query));

app.listen(
    port,
    () => {
        // eslint-disable-next-line no-undef
        console.log(`Сервер запущен на порту ${port}`);
    },
);

process.on('exit', () => db.close());
