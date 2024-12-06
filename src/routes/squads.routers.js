//====================================================================================================================
//====================================================================================================================
// src/routes/sqauds.router.js
//
//====================================================================================================================
//====================================================================================================================
import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

//스쿼드를 구성하는 API
//인증 미들웨어에서 userid를 받아온다.
//body에서 각각의 index를 받아온다.
//userteams는 여러 개를 추가할 수 있겠다.
//userSquad에는 각 유저 당 3개만 들어갈 수 있도록 한다.
//이미 스쿼드가 등록된 경우에는 마지막 Squad를 수정하도록 한다.
router.post("/squads", authMiddleware, async (req, res, next) => {
  try {
    const { squadList } = req.body;
    const user = req.user;

    for (let i of squadList) {
      if (typeof i != "number") {
        throw new Error("입력 값이 잘못되었습니다.");
      }
    }

    //teams 내에 현재 로그인한 유저의 것이며 isSquad가 참인 것을 모두 조회한다.
    //그것들을 모두 squad 해제시킨다.
    //그 다음 지정 받은 index를 베이스로 값을 가져오도록 하자.
    const squadTransaction = await prisma.$transaction(async (tx) => {
      //먼저 teams 내의 squad 에서 user의 팀을 해제한다.
      const updatedTeam = await tx.userTeams.updateMany({
        where: {
          AND: {
            userId: user.id,
            isSquad: true,
          },
        },
        data: {
          isSquad: false,
        },
      });

      //다음 입력 받은 인덱스를 받아 팀을 만든다.
      const updatingTeam = await tx.userTeams.updateMany({
        where: {
          AND: {
            userId: user.id,
            id: {
              in: squadList,
            },
          },
        },
        data: {
          isSquad: true,
        },
      });

      const check = await tx.userTeams.findMany({
        where: {
          userId: user.id,
          AND: {
            isSquad: true,
          },
        },
      });

      if (!updatingTeam) {
        throw new Error("업데이트가 되지 않았습니다.");
      }

      if (check.length !== 3) {
        throw new Error("숫자가 다릅니다.");
      }
    });

    return res.status(200).json({ message: "스쿼드 편성 완료!" });
  } catch (err) {
    if (err === "invaildIndex") {
      res.status(404).json({ message: "확실치 않은 인덱스!" });
    } else {
      next(err);
    }
  }
});

//자신의 squad 출력
router.get("/squads", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    const userSquads = await prisma.userTeams.findMany({
      where: {
        AND: {
          userId: user.id,
          isSquad: true,
        },
      },
    });

    if (!userSquads)
      return res.status(404).json({ message: "[Not Found] Squad creation failed" });

    return res.status(201).json({ data: userSquads });
  } catch (err) {
    next(err);
  }
});

export default router;
