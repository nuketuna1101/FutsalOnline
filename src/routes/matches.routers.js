//====================================================================================================================
//====================================================================================================================
// src/routes/matches.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import simulateMatch from '../utils/gameLogic/gameLogic.js';


const router = express.Router();


//====================================================================================================================
//====================================================================================================================
// 매치메이킹 API: 랜덤상대 매치메이킹
// URL: /api/matches
// method: POST
// auth: 인증 필요
// validation:
//====================================================================================================================
//====================================================================================================================
router.post('/matches', authMiddleware, async (req, res, next) => {
    // 1. auth로부터 user id가져오기
    const { userId } = req.user;
    try {
        // 2. 랜덤 상대 userId 가져오기
        const randomOpponents = await prisma.users.findMany({
            where: { id: { not: userId }, }
        });
        // validation: 랜덤매칭 후보군 없을시
        const len = randomOpponents.length;
        if (len === 0)
            return res.status(404).json({ message: '[Not Found] 매칭상대 찾기 실패.' });
        // 랜덤하게 생성
        const randomIndex = crypto.randomInt(0, len);
        const randomOpponent = randomOpponents[randomIndex];

        // 2. userId로부터 team > squad 찾기

        /*
        // Legacy code: 현재 상태인 단일 팀만 지원
        const userSquad = await prisma.userSquads.findMany({
            where: { userTeamId: userId },
            include: {
                userteam: {
                    include: { players: { include: { playerStats: true }, } }
                },
            },
        });
        const opponentSquad = await prisma.userSquads.findMany({
            where: { userTeamId: randomOpponent.id },
            include: {
                userteam: {
                    include: { players: { include: { playerStats: true }, } }
                },
            },
        });
        */
        // renewal: 이후에 유저가 여러개의 팀을 가지더라도 가능하게끔
        const userTeams = await prisma.userTeams.findMany({ 
            where: { userId } 
        });
        if (userTeams.length === 0)
            return res.status(404).json({ message: '[Not Found] 유저 팀 찾지못함' });

        const opponentTeams = await prisma.userTeams.findMany({ 
            where: { userId: randomOpponent.id } 
        });
        if (opponentTeams.length === 0)
            return res.status(404).json({ message: '[Not Found] 상대 팀 찾지못함' });

        const userSquad = await prisma.userSquads.findMany({
            where: { userTeamId: { in: userTeams.map(team => team.id) } },
            include: { userteam: { include: { players: { include: { playerStats: true } } } } }
        });
        if (userSquad.length === 0)
            return res.status(404).json({ message: '[Not Found] 유저 스쿼드 찾지못함' });

        const opponentSquad = await prisma.userSquads.findMany({
            where: { userTeamId: { in: opponentTeams.map(team => team.id) } },
            include: { userteam: { include: { players: { include: { playerStats: true } } } } }
        });
        if (opponentSquad.length === 0)
            return res.status(404).json({ message: '[Not Found] 상대 스쿼드 찾지못함' });

        // utils에서 게임로직통해 매치에서의 양팀 스코어 생성
        const { userSquadScore, opponentSquadScore } = simulateMatch(userSquad, opponentSquad);




        // 매치 생성
        const match = await prisma.matches.create({
            data: {
                matchUserId1: userId,
                matchUserId2: randomOpponent.id,
                matchResult: 'DRAW',
            }
        });

        return res.status(200).json({
            message: '[Success] match created.',
            match,
        });

    } catch (error) {
        next(error);
    }
});

//====================================================================================================================
//====================================================================================================================
// 매치메이킹 API: 지정 상대 매치메이킹
// URL: /api/matches/:playerId
// method: POST
// auth: 인증 필요
// validation:
//====================================================================================================================
//====================================================================================================================
router.post('/matches/:playerId', authMiddleware, async (req, res, next) => {
    // auth로부터 user id가져오기
    const { userId } = req.user;
    try {

        // 로그인 성공
        return res.status(200).json({ message: '[Success] log-in completed.' });

    } catch (error) {
        next(error);
    }
});

//====================================================================================================================
//====================================================================================================================
// 직전 경기 결과 조회 API
// URL: /api/matches/latest
// method: GET
// auth: 인증 필요
// validation:
//====================================================================================================================
//====================================================================================================================
router.get('/matches/latest', authMiddleware, async (req, res, next) => {
    // auth로부터 user id가져오기
    const { userId } = req.user;
    try {
        // 유저의 최근 10경기 매치 결과 가져오기
        const recentMatches = await prisma.matches.findMany({
            /* todo */
            //where: { matchUserId1: },
            orderBy: { matchDate: 'desc' },
            take: 10,
        });

        // validation: 매치기록이 아예 없을 경우
        if (recentMatches.length === 0)
            return res.status(200).json({ message: '최근 매치기록이 없습니다.', });

        return res.status(200).json({ recentMatches });

    } catch (error) {
        next(error);
    }
});
//====================================================================================================================
//====================================================================================================================
// 유저의 최근 10경기 매치 결과에 대한 조회
// URL: /api/matches
// method: GET
// auth: 인증 필요
// validation: 매치기록이 아예 없을 경우
//====================================================================================================================
//====================================================================================================================
router.get('/matches/recent?count=10', authMiddleware, async (req, res, next) => {
    // auth로부터 user id가져오기
    const { userId } = req.user;
    try {
        // 유저의 최근 10경기 매치 결과 가져오기
        const recentMatches = await prisma.matches.findMany({
            /* todo */
            //where: { matchUserId1: },
            orderBy: { matchDate: 'desc' },
            take: 10,
        });

        // validation: 매치기록이 아예 없을 경우
        if (recentMatches.length === 0)
            return res.status(200).json({ message: '최근 매치기록이 없습니다.', });

        return res.status(200).json({ recentMatches });

    } catch (error) {
        next(error);
    }
});
export default router;