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
router.post('/users/sign-up', async (req, res, next) => {
    try {
        const { userName, password, nickname } = req.body;

        const isExistId = await prisma.users.findFirst({
            where: { nickname }
        });
        // 아이디, 비밀번호 영어소문자 + 숫자 유효성검사용 변수
        function conLowAndNumber(input) {
            // 영어 소문자와 숫자가 모두 포함된 문자열
            const regex = /^(?=.*[a-z])(?=.*[0-9]).+$/;
            return regex.test(input);
        }

        if (isExistId) {
            return res.status(409).json({ Message: '이미 존재하는 아이디입니다.' });
        } else if (conLowAndNumber(nickname) === false) {
            return res.status(401).json({ Message: '아이디는 영어소문자 + 숫자로 이루어져야합니다.' })
        } else if (password.length <= 5) {
            return res.status(401).json({ Message: '비밀번호는 6자리 이상이어야 합니다.' });
        } else if (conLowAndNumber(password) === false) {
            return res.status(401).json({ Message: '비밀번호는 영어소문자 + 숫자로 이루어져야합니다.' })
        }

        // 비밀번호 hash작업
        const hashedPassword = await bcrypt.hash(password, 10);

        const [Users, UserAccount] = await prisma.$transaction(async (tx) => {
            try {
                const users = await tx.users.create({
                    data: {
                        nickname,
                        password: hashedPassword,
                        userName,
                    },
                });

                const userAccount = await tx.userAccount.create({
                    data: {
                        userId: users.id,
                        cash: 5000,
                    },
                });

                return [users, userAccount];
            } catch (error) {
                console.error("Transaction Error:", error);
                // 트랜잭션 실패 시 예외를 다시 던짐
                throw error;
            }
        });
        return res.status(201).json({ Message: `회원가입완료 ${nickname}, ${userName}` })
    } catch (err) {
        next(err);
    }
});

// 로그인
router.post('/users/sign-in', async (req, res, next) => {
    try {
        const { nickname, password } = req.body;

        const user = await prisma.users.findFirst({
            where: { nickname }
        })

        if (!user) {
            return res.status(401).json({ Message: '존재하지 않는 아이디입니다.' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ Message: '비밀번호가 일치하지 않습니다.' });
        }
        // req.session.userId = Number(user.id);

        const accessToken = jwt.sign(
            {
                id: Number(user.id),
            },
            'custom-secret-key',
            {
                expiresIn: '10m'
            }
        );
        console.log("check accessToken: " + (accessToken == null));
        res.cookie('authorization', `Bearer ${accessToken}`);
        return res.status(200).json({ Message: `${nickname} 로그인 성공` });
    } catch (err) {
        next(err);
    }
});

// 캐시 지급
router.post('/users/cash', authMiddleware, async (req, res, next) => {
    try {
        const user = req.user;

        if(!user || !user.id) {
            return res.status(401).json({ message: "인증되지 않은 사용자 입니다."})
        }
        
        const addCash = 5000;

        const userAccount = await prisma.userAccount.findUnique({
            where: {
                userId: user.id,
            },
        });

        if(!userAccount){
            return res.status(404).json({ message: "사용자 계정을 찾을 수 없습니다."});
        }

        const afterCash = await prisma.userAccount.update({
            where: { userId : user.id },
            data: {
                cash: { increment: addCash}
            },
        });
        return res.status(201).json({ Message: `${addCash}를 얻었습니다.` });
    } catch (err) {
        next(err);
    }
});

export default router;