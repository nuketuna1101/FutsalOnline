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
import { INITIAL_ELO } from '../config/elo.config.js';

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

        const [Users, UserAccount, UserElo] = await prisma.$transaction(async (tx) => {
            try {
                // 유저 테이블 추가
                const users = await tx.users.create({
                    data: {
                        nickname,
                        password: hashedPassword,
                        userName,
                    },
                });
                // 유저 어카운트 테이블 추가
                const userAccount = await tx.userAccount.create({
                    data: {
                        userId: users.id,
                        cash: 5000,
                    },
                });
                // 유저 elo 테이블 추가
                const userElo = await tx.userElo.create({
                    data: {
                        userId: users.id,
                        userRating: INITIAL_ELO,
                    },
                });

                return [users, userAccount, userElo];
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


//====================================================================================================================
//====================================================================================================================
// src/routes/users.router.js
// 로그인 api
//====================================================================================================================
//====================================================================================================================
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

        if (!user || !user.id) {
            return res.status(401).json({ message: "인증되지 않은 사용자 입니다." })
        }

        const addCash = 5000;

        const userAccount = await prisma.userAccount.findUnique({
            where: {
                userId: user.id,
            },
        });

        if (!userAccount) {
            return res.status(404).json({ message: "사용자 계정을 찾을 수 없습니다." });
        }

        const afterCash = await prisma.userAccount.update({
            where: { userId: user.id },
            data: {
                cash: { increment: addCash }
            },
        });
        return res.status(201).json({ Message: `${addCash}캐시를 얻었습니다.` });
    } catch (err) {
        next(err);
    }
});

// 다른 유저의 스쿼드 조회
router.get('/users/squad/:userId', async (req, res, next) => {
    try {
        const userId = Number(req.params.userId);
        const sqauds = await prisma.userTeams.findMany({
            where: {
                userId: userId,
                isSquad: true,
            },
            include: {
                players: {
                    include: {
                        playerStats: true,
                    }
                },
            },
        });
        if (!sqauds) {
            return res.status(404).json({ message: '사용자의 스쿼드가 없습니다.' });
        };
        return res.status(200).json({ data: sqauds });
    } catch (err) {
        next(err)
    }
});

//====================================================================================================================
//====================================================================================================================
// 인증된 유저의 userRating 기반한 랭킹 조회
// response: 유저의 userRating 수치, 실제 몇번째 랭킹인지, user를 포함해서 userRating 수치가 인접한 5명 목록 조회 
// (유저가 1등이라면 1,2,3,4,5등, 유저가 9등이라면, 7,8,9,10,11 등)
//====================================================================================================================
//====================================================================================================================
router.get('/users/ranks', authMiddleware, async (req, res, next) => {
    // auth로부터 user id가져오기
    const userId = req.user.id;
    try {
        const userElo = await prisma.userElo.findUnique({
            where: { userId },
            select: { userRating: true },
        });
        // validation: 유저 elo 찾았는지
        if (!userElo)
            return res.status(404).json({ message: '[Not Found] 유저의 랭킹 정보 찾을 수 없음.' });

        // 유저의 rating 점수
        const userRating = userElo.userRating;
        // 2. 요청 유저의 랭킹 계산
        const userRank = await prisma.userElo.count({
            where: { userRating: { gt: userRating } },
        }) + 1;

        // 3. 인접한 5명 정보 조회
        const neighbors = await prisma.userElo.findMany({
            orderBy: { userRating: 'desc' },
            skip: Math.max(userRank - 3, 0),
            take: 5,
            select: {
                userId: true,
                userRating: true,
                user: { select: { userName: true, nickname: true } },
            },
        });

        // 4. 결과 반환
        return res.status(200).json({
            message: '[Success] 랭킹 조회 성공',
            userRank,
            userRating,
            neighborUsers: neighbors.map((user, index) => ({
                rank: userRank - 2 + index,
                userId: user.userId,
                nickname: user.user.nickname,
                userName: user.user.userName,
                userRating: user.userRating,
            })),
        });


    } catch (error) {
        next(error);
    }
});

//====================================================================================================================
//====================================================================================================================
// 미인증 상태로, 지정한 유저의 userRating 기반한 랭킹 조회
// response: 유저의 userRating 수치, 실제 몇번째 랭킹인지, user를 포함해서 userRating 수치가 인접한 5명 목록 조회 
// (유저가 1등이라면 1,2,3,4,5등, 유저가 9등이라면, 7,8,9,10,11 등)
//====================================================================================================================
//====================================================================================================================
router.get('/users/ranks/:userId', async (req, res, next) => {
    // auth로부터 user id가져오기
    const userId = parseInt(req.params.userId, 10);
    // validation: userId 검증
    if (isNaN(userId)) 
        return res.status(400).json({ message: '[Bad Request] 유효하지 않은 userId' });
    
    try {
        const userElo = await prisma.userElo.findUnique({
            where: { userId },
            select: { userRating: true },
        });
        // validation: 유저 elo 찾았는지
        if (!userElo)
            return res.status(404).json({ message: '[Not Found] 유저의 랭킹 정보 찾을 수 없음.' });

        // 유저의 rating 점수
        const userRating = userElo.userRating;
        // 2. 요청 유저의 랭킹 계산
        const userRank = await prisma.userElo.count({
            where: { userRating: { gt: userRating } },
        }) + 1;

        // 3. 인접한 5명 정보 조회
        const neighbors = await prisma.userElo.findMany({
            orderBy: { userRating: 'desc' },
            skip: Math.max(userRank - 3, 0),
            take: 5,
            select: {
                userId: true,
                userRating: true,
                user: { select: { userName: true, nickname: true } },
            },
        });

        // 4. 결과 반환
        return res.status(200).json({
            message: '[Success] 랭킹 조회 성공',
            userRank,
            userRating,
            neighborUsers: neighbors.map((user, index) => ({
                rank: userRank - 2 + index,
                userId: user.userId,
                nickname: user.user.nickname,
                userName: user.user.userName,
                userRating: user.userRating,
            })),
        });


    } catch (error) {
        next(error);
    }
});


//====================================================================================================================
//====================================================================================================================
// 미인증 상태로, userRating 기반하여 상위 랭커 조회
// response: 상위 n명(최대n 제한)의 userRating 수치, 실제 몇번째 랭킹인지
//====================================================================================================================
//====================================================================================================================
router.get('/users/ranks/top', async (req, res, next) => {
    // 쿼리 파라미터에서 가져온 count (default 및 최대제약: 10)
    const count = Math.min(parseInt(req.query.count, 10) || 10, 10);
    try {
        // 상위 랭커 정보 가져오기
        const topRankers = await prisma.userElo.findMany({
            orderBy: { userRating: 'desc' },
            take: count,
            select: {
                userId: true,
                userRating: true,
                user: { select: { userName: true, nickname: true } },
            },
        });
        // validation: 랭커가 아무도 존재하지 않음
        if (topRankers.length === 0)
            return res.status(404).json({ message: '[Not Found] 그 어느 랭커가 존재하지 않음.' });

        // response 반환
        const response = topRankers.map((user, index) => ({
            rank: index + 1,
            userId: user.userId,
            nickname: user.user.nickname,
            userName: user.user.userName,
            userRating: user.userRating,
        }));

        return res.status(200).json({
            message: '[Success] Top Rankers below.',
            topRankers: response,
        });
    } catch (error) {
        next(error);
    }
});

export default router;