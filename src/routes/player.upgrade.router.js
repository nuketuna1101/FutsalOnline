//====================================================================================================================
//====================================================================================================================
// src/routes/player.router.router.js
// 선수 강화 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import csvToJson from "../public/csvToJson";

const router = express.Router();

/* TO DO */
//선수 강화
router.post("/players/:playerId/upgrade", authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const playerId = parseInt(req.params.playerId, 10);

      if (!userId) {
        return res.status(404).json({ message: "사용자가 존재하지 않습니다." });
      }

      const selectPlayer = await prisma.userTeams.findFirst({
        where: {
          userId: userId,
          playerId: playerId,
        },
        select: {
          playerUpgrade: true,
          players: {
            select: {
                playerName: true,
            },
          },
        },
      });

      if (!selectPlayer) {
        return res.status(404).json({ message: "사용자가 이 선수를 가지고 있지 않습니다." });
      }

      // CSV 파일 경로를 지정하세요
      const filePath = "./data/upgradePercent.csv";
      const jsonData = await csvToJson(filePath);

    // playerName 가져오기
    const playerName = selectPlayer.players.playerName;
     // 현재 강화 레벨
    const currentUpgradeLevel = selectPlayer.playerUpgrade;

    console.log("currentUpgradeLevel:", currentUpgradeLevel); // 디버깅
    console.log("jsonData:", jsonData); // 디버깅

    // CSV 데이터에서 해당 강화 레벨(index)에 해당하는 확률 데이터 찾기
    const upgradeData = jsonData.find(
      (row) => parseInt(row.index) === currentUpgradeLevel
    );

      if (!upgradeData) {
        return res.status(404).json({ message: `강화 레벨 ${currentUpgradeLevel}에 대한 데이터가 없습니다.`});
      }

      // 강화 확률 정보
      const successRate = upgradeData.success;
      const faultRate = upgradeData.fault;
      const destroyRate = upgradeData.destroy;

      //강화 재료는 선수로 갯수 제한은 1~5개
      

      return res.status(200).json({ message: "강화성공", data: {playerName, successRate, faultRate, destroyRate} });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
