//====================================================================================================================
//====================================================================================================================
// src/routes/matches.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================
import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import simulateMatch from "../utils/gameLogic/gameLogic.js";
import { MATCHMAKING_TRIALS_CONSTRAINTS } from "../config/gameLogic.config.js";
import crypto from "crypto";
import {MATCHING_RANGE,ELO_WINNER_INCREMENT,ELO_LOSER_DECREMENT,} from "../config/elo.config.js";

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
router.post("/matches", authMiddleware, async (req, res, next) => {
  // 1. auth로부터 user id가져오기
  const userId = req.user.id;

  try {
    // 현재 유저의 Elo 점수 가져오기
    const userElo = await prisma.userElo.findUnique({
      where: { userId },
      select: { userRating: true },
    });

    // validation: 유저 Elo 점수 확인
    if (!userElo)
      return res.status(404).json({ message: "[Not Found] 유저의 Elo 점수를 찾을 수 없음." });

    const { userRating } = userElo;

    // # 점수 기반 매칭 시작
    // 매칭 범위 초기 설정
    let range = MATCHING_RANGE;
    const maxTrials = MATCHMAKING_TRIALS_CONSTRAINTS;
    let trials = 0;

    let randomOpponent = null;
    while (!randomOpponent && trials < maxTrials) {
      trials++;
      const opponents = await prisma.userElo.findMany({
        where: {
          userId: { not: userId },
          userRating: { gte: userRating - range, lte: userRating + range },
        },
        select: { userId: true, userRating: true },
      });

      // 스쿼드가 존재하는 유저만 필터링
      const validOpponents = [];
      for (const opponent of opponents) {
        const squadExists = await prisma.userTeams.findFirst({
          where: { userId: opponent.userId, isSquad: true },
        });

        if (squadExists) validOpponents.push(opponent);
      }

      if (validOpponents.length > 0) {
        randomOpponent =
          validOpponents[crypto.randomInt(0, validOpponents.length)];
      } else {
        range += MATCHING_RANGE;
      }
    }

    // validation: 매칭 상대 찾기 실패
    if (!randomOpponent)
      return res
        .status(404)
        .json({ message: "[Not Found] 적합한 매칭 상대를 찾을 수 없음." });

    // 유저 스쿼드 및 상대 스쿼드 가져오기
    const [userSquad, opponentSquad] = await Promise.all([
      prisma.userTeams.findMany({
        where: { userId, isSquad: true },
        include: {
          players: {
            select: { id: true, playerName: true, playerStats: true },
          },
        },
      }),
      prisma.userTeams.findMany({
        where: { userId: randomOpponent.userId, isSquad: true },
        include: {
          players: {
            select: { id: true, playerName: true, playerStats: true },
          },
        },
      }),
    ]);
    // validation: 스쿼드 확인
    if (userSquad.length === 0)
      return res
        .status(404)
        .json({ message: "[Not Found] 유저 스쿼드를 찾을 수 없음." });
    if (opponentSquad.length === 0)
      return res
        .status(404)
        .json({ message: "[Not Found] 상대 스쿼드를 찾을 수 없음." });

    // utils에서 게임로직통해 매치에서의 양팀 스코어 생성
    const { userSquadScore, opponentSquadScore } = simulateMatch(
      userSquad,
      opponentSquad
    );
    // 스코어에 따른 승패 판정
    const matchResult =
      userSquadScore > opponentSquadScore
        ? "USER1WIN"
        : userSquadScore < opponentSquadScore
        ? "USER2WIN"
        : "DRAW";

    // TRANSACTION: 매치 결과 생성과 점수 업데이트는 일관성있게 진행되어야함
    const [match, userEloUpdate, opponentEloUpdate] = await prisma.$transaction(
      [
        // 매치 결과 생성
        prisma.matches.create({
          data: {
            matchUserId1: userId,
            matchUserId2: randomOpponent.userId,
            matchResult: matchResult,
          },
        }),
        // 매치 결과에 따른 elo 레이팅 업데이트
        prisma.userElo.update({
          where: { userId },
          data: {
            userRating: {
              increment:
                matchResult === "USER1WIN"
                  ? ELO_WINNER_INCREMENT
                  : matchResult === "USER2WIN"
                  ? ELO_LOSER_DECREMENT
                  : 0,
            },
          },
        }),
        prisma.userElo.update({
          where: { userId: randomOpponent.userId },
          data: {
            userRating: {
              increment:
                matchResult === "USER2WIN"
                  ? ELO_WINNER_INCREMENT
                  : matchResult === "USER1WIN"
                  ? ELO_LOSER_DECREMENT
                  : 0,
            },
          },
        }),
      ]
    );
    // validation: transaction 올바르게 만들었는지
    if (!match) throw new Error("[Transaction Failed] Match creation failed.");
    if (!userEloUpdate || !opponentEloUpdate)
      throw new Error("[Transaction Failed] Score update failed.");

    // 성공적으로 완료된 경우
    return res.status(200).json({
      message: "[Success] Match created successfully.",
      match,
      user: {
        userId,
        userNewRating: userEloUpdate.userRating,
      },
      opponent: {
        userId: randomOpponent.id,
        opponentNewRating: opponentEloUpdate.userRating,
      },
      matchResult: {
        message: `[Match Result] : [${userSquadScore} : ${opponentSquadScore}] >> ${matchResult}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

//====================================================================================================================
//====================================================================================================================
// 매치메이킹 API: 지정 상대 매치메이킹
// URL: /api/matches/:userId
// method: POST
// auth: 인증 필요
// validation:
//====================================================================================================================
//====================================================================================================================
router.post("/matches/:userId", authMiddleware, async (req, res, next) => {
  // auth로부터 user id가져오기
  const userId = req.user.id;
  // param으로부터 상대 id
  const opponentUserId = parseInt(req.params.userId, 10);
  // validation: 자기 자신에게 걸 순 없음.
  if (userId === opponentUserId)
    return res.status(400).json({ message: "[Bad Request] 자기 자신의 아이디 입력함." });

  try {
    // validation: 지정 상대 존재하는지 체크
    const opponent = await prisma.users.findFirst({
      where: { id: opponentUserId },
    });
    if (!opponent)
      return res.status(404).json({ message: "[Not Found] 지목한 매칭상대를 찾지 못함." });

    // 2. userId와 randomOpponent.id 이용해서 스쿼드 넘겨주기.
    let [userSquad, opponentSquad] = await Promise.all([
      prisma.userTeams.findMany({
        where: {
          userId: userId,
          isSquad: true,
        },
        include: {
          players: {
            select: {
              id: true,
              playerName: true,
              playerStats: true,
            },
          },
        },
      }),
      prisma.userTeams.findMany({
        where: {
          userId: opponentUserId,
          isSquad: true,
        },
        include: {
          players: {
            select: {
              id: true,
              playerName: true,
              playerStats: true,
            },
          },
        },
      }),
    ]);
    // squad: team 잘 찾았는지
    if (userSquad.length === 0)
      return res.status(404).json({ message: "[Not Found] 유저 스쿼드 찾지못함" });
    if (opponentSquad.length === 0)
      return res.status(404).json({ message: "[Not Found] 상대 스쿼드 찾지못함" });

    // utils에서 게임로직통해 매치에서의 양팀 스코어 생성
    const { userSquadScore, opponentSquadScore } = simulateMatch(
      userSquad,
      opponentSquad
    );

    // 스코어에 따른 승패 판정
    const matchResult =
      userSquadScore > opponentSquadScore
        ? "USER1WIN"
        : userSquadScore < opponentSquadScore
        ? "USER2WIN"
        : "DRAW";

    // TRANSACTION: 매치 결과 생성과 점수 업데이트는 일관성있게 진행되어야함
    const [match, userElo, opponentElo] = await prisma.$transaction([
      // 매치 결과 생성
      prisma.matches.create({
        data: {
          matchUserId1: userId,
          matchUserId2: opponentUserId,
          matchResult: matchResult,
        },
      }),
      // 매치 결과에 따른 elo 레이팅 업데이트
      prisma.userElo.update({
        where: { userId },
        data: {
          userRating: {
            increment:
              matchResult === "USER1WIN"
                ? ELO_WINNER_INCREMENT
                : matchResult === "USER2WIN"
                ? ELO_LOSER_DECREMENT
                : 0,
          },
        },
      }),
      prisma.userElo.update({
        where: { userId: opponentUserId },
        data: {
          userRating: {
            increment:
              matchResult === "USER2WIN"
                ? ELO_WINNER_INCREMENT
                : matchResult === "USER1WIN"
                ? ELO_LOSER_DECREMENT
                : 0,
          },
        },
      }),
    ]);
    // validation: transaction 올바르게 만들었는지
    if (!match) throw new Error("[Transaction Failed] Match creation failed.");
    if (!userElo || !opponentElo)
      throw new Error("[Transaction Failed] Score update failed.");

    // 성공적으로 완료된 경우
    return res.status(200).json({
      message: "[Success] Match created successfully.",
      match,
      user: {
        userId,
        userNewRating: userElo.userRating,
      },
      opponent: {
        userId: opponentUserId,
        opponentNewRating: opponentElo.userRating,
      },
      matchResult: {
        message: `[Match Result] : [${userSquadScore} : ${opponentSquadScore}] >> ${matchResult}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

//====================================================================================================================
//====================================================================================================================
// 유저가 치른 직전 경기 결과 조회 API
// URL: /api/matches/latest
// method: GET
// auth: 인증 필요
// validation:
//====================================================================================================================
//====================================================================================================================
router.get("/matches/latest", authMiddleware, async (req, res, next) => {
  // auth로부터 user id가져오기
  const userId = req.user.id;
  try {
    // 유저의 최근 10경기 매치 결과 가져오기
    const latestMatch = await prisma.matches.findFirst({
      where: {
        OR: [{ matchUserId1: userId }, { matchUserId2: userId }],
      },
      orderBy: { matchDate: "desc" },
      include: {
        user1: { select: { nickname: true } },
        user2: { select: { nickname: true } },
      },
    });

    // validation: 매치기록이 아예 없을 경우
    if (!latestMatch)
      return res
        .status(200)
        .json({ message: "마지막으로 치른 매치기록 로드 실패" });

    return res.status(200).json({ latestMatch });
  } catch (error) {
    next(error);
  }
});
//====================================================================================================================
//====================================================================================================================
// 유저의 최근 n경기 매치 결과에 대한 조회
// URL: /matches/recent
// method: GET
// auth: 인증 필요
// validation: 매치기록이 아예 없을 경우
//====================================================================================================================
//====================================================================================================================
router.get("/matches/recent", authMiddleware, async (req, res, next) => {
  // auth로부터 user id가져오기
  const userId = req.user.id;
  // 쿼리 파라미터에서 가져온 count (default 및 최대제약: 10) // 추후에 config에 뺄 것
  const count = parseInt(req.query.count, 10) || 10;
  try {
    // 유저의 최근 10경기 매치 결과 가져오기
    const recentMatches = await prisma.matches.findMany({
      where: {
        OR: [{ matchUserId1: userId }, { matchUserId2: userId }],
      },
      orderBy: { matchDate: "desc" },
      take: count,
      include: {
        user1: { select: { nickname: true } },
        user2: { select: { nickname: true } },
      },
    });
    // validation: 매치기록이 아예 없을 경우
    if (recentMatches.length === 0)
      return res.status(200).json({ message: "최근 매치기록이 없습니다." });

    return res.status(200).json({ recentMatches });
  } catch (error) {
    next(error);
  }
});

export default router;
