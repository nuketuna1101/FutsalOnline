//====================================================================================================================
//====================================================================================================================
// src/middlewares/auth.middleware.js
// 인증 미들웨어
//====================================================================================================================
//====================================================================================================================
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import dotenv from 'dotenv';

dotenv.config();


export default async function (req, res, next) {

    /* TODO */
}