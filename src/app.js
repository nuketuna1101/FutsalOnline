// src/app.js

import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import expressMySQLSession from 'express-mysql-session';
// middlewares
import LoggingMiddleware from './middlewares/logging.middleware.js';
import ErrorHandlingMiddleware from './middlewares/errorHandling.middleware.js';
// routers
import usersRouter from './routes/users.routers.js';
import playersRouter from './routes/players.routers.js';
import matchesRouter from './routes/matches.routers.js';
import squadsRouter from './routes/squads.routers.js';
import gatchaRouter from './routes/gatcha.router.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// const PORT = process.env.CURRENT_PORT;
const PORT = 3321;

const MySQLStore = expressMySQLSession(expressSession);
const sessionStore = new MySQLStore({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24,
  createDatabaseTable: true,
});

// Middlewares
app.use(LoggingMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
    expressSession({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
          // 클라이언트에서 쿠키 접근 차단
          httpOnly: true, 
          // HTTPS에서만 작동하도록 설정 (로컬 개발에서는 false)
          secure: false, 
          // 1일 동안 쿠키를 사용할 수 있도록 설정한다.
          maxAge: 1000 * 60 * 60 * 24,
        },
        store: sessionStore,
    })
);

app.use('/api', [usersRouter, playersRouter, matchesRouter, squadsRouter,gatchaRouter]);
app.use(ErrorHandlingMiddleware);


app.listen(PORT, () => {
  console.log(PORT, 'port opened == futsal Online Server running!');
});