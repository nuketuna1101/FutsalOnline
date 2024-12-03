//====================================================================================================================
//====================================================================================================================
// src/routes/users.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
// 회원가입
router.post('/api/users/sign-up', async (req, res, next) => {
    try {
        const { userName, password, nickname } = req.body;

        const isExistId = await prisma.user.findFirst({
            where: { nickname }
        });
        // 아이디, 비밀번호 영어소문자 + 숫자 유효성검사용 변수
        let engPlusNum = /^[a-z0-9]$/;

        if (isExistId) {
            return res.status(409).json({ Message: '이미 존재하는 아이디입니다.' });
        } else if (engPlusNum.test(nickName) === false) {
            return res.status(401).json({ Message: '아이디는 영어소문자 + 숫자로 이루어져야합니다.' })
        } else if (password.length <= 5) {
            return res.status(401).json({ Message: '비밀번호는 6자리 이상이어야 합니다.' });
        } else if (engPlusNum.test(password) === false) {
            return res.status(401).json({ Message: '비밀번호는 영어소문자 + 숫자로 이루어져야합니다.' })
        }

        // 비밀번호 hash작업
        const hashedPassword = await bcrypt.hash(password, 10);

        const [Users, UserAccount] = await prisma.$transaction(async (tx) => {
            const users = await tx.user.create({
                data: {
                    nickname,
                    password: hashedPassword,
                    userName: userName,
                }
            });

            const userAccount = await tx.user.create({
                data: {
                    cash: 5000,
                }
            });

            return [users, userAccount]

        });
    } catch (err) {
        next(err);
    }

    return res.status(201).json({ Message: `회원가입완료 ${nickname}, ${userName}` })
});

// 로그인
router.post('/api/users/sign-in', async (req, res, next) => {
    try {
        const { nickname, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { nickname }
        })

        if (!user) {
            return res.status(401).json({ Message: '존재하지 않는 아이디입니다.' });
        } else if (await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ Message: '비밀번호가 일치하지 않습니다.' });
        }

        req.session.nickname = user.nickname;
        const token = jwt.sign(
            {
                nickname: user.nickname,
            },
            'futsal-secret-key',
            {
                expiresIn: '10m'
            }
        );
    } catch (err) {
        next(err);
    }

    res.cookie('authMiddleware', `Bearer ${token}`);
    return res.status(200).json({ Message: `${nickname} 로그인 성공` });
});
// 캐시 지급
router.post('api/users/cash', authMiddleware, async (req, res, next) => {
    try{
        
    }catch(err){
        next(err);
    }

})

export default router;