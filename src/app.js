// src/app.js

import express from 'express';
import cookieParser from 'cookie-parser';
// middlewares
import LoggingMiddleware from './middlewares/logging.middleware.js';
import ErrorHandlingMiddleware from './middlewares/errorHandling.middleware.js';
// routers
import usersRouter from './routes/users.routers.js';
import playersRouter from './routes/players.routers.js';
import matchesRouter from './routes/matches.routers.js';
import squadsRouter from './routes/squads.routers.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT_NUMBER;

// Middlewares
app.use(LoggingMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/api', [usersRouter, playersRouter, matchesRouter, squadsRouter]);
app.use(ErrorHandlingMiddleware);


app.listen(PORT, () => {
  console.log(PORT, 'port opened == item-simulator Server running!');
});