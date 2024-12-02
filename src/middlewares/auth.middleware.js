//====================================================================================================================
//====================================================================================================================
// src/middlewares/auth.middleware.js
// 인증 미들웨어
//====================================================================================================================
//====================================================================================================================
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'

dotenv.config();

const SECRET_KEY = 'your-secret-key'; // Access Token Secret
const REFRESH_SECRET_KEY = 'your-refresh-secret-key'; // Refresh Token Secret

// 1. 비밀번호 암호화 및 검증 (기존 코드 유지)
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);

// 2. Access Token 생성
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' }); // 15분 유효
};

// 3. Refresh Token 생성
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET_KEY, { expiresIn: '7d' }); // 7일 유효
};

// 4. Refresh Token 검증
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY);
  } catch (err) {
    return null;
  }
};


export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    if (!authorization) throw new Error('토큰이 존재하지 않습니다.');

    const [tokenType, token] = authorization.split(' ');

    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');


    const decodedToken = jwt.verify(token, SECRET_KEY);
    const userId = parseInt(decodedToken.userId, 10);

    if (!userId) {
      throw new Error("로그인이 필요합니다.")
    }

    const user = await prisma.users.findFirst({
      where: {
        id: userId
      }
    })

    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.userId = user.id;
    next();


    /* TODO */
  }
  catch (err) {
    next(err);
  }
}


