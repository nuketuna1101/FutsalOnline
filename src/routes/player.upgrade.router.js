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

//선수 강화
router.post("/players/:userTeamId/upgrade", authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userTeamId = parseInt(req.params.userTeamId, 10);

      if (!userId) {
        return res.status(404).json({ message: "사용자가 존재하지 않습니다." });
      }

      const selectPlayer = await prisma.userTeams.findFirst({
        where: {
          userId: userId,
          id: userTeamId,
        },
        select: {
          playerUpgrade: true,
          players: {
            select: {
              playerName: true,
              // playerId를 가져오기 위해 추가
              id: true, 
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

      const playerName = selectPlayer.players.playerName;
      const playerId = selectPlayer.players.id;
      const currentUpgradeLevel = selectPlayer.playerUpgrade;

      // CSV 데이터에서 해당 강화 레벨(index)에 해당하는 확률 데이터 찾기
      const upgradeData = jsonData.find(
        (row) => parseInt(row.index) === currentUpgradeLevel
      );

      if (!upgradeData) {
        return res.status(404).json({
          message: `강화 레벨 ${currentUpgradeLevel}에 대한 데이터가 없습니다.`,
        });
      }

      const successRate = upgradeData.success;
      const faultRate = upgradeData.fault;
      const destroyRate = upgradeData.destroy;

      const materialsPlayer = await prisma.userTeams.findMany({
        where: {
          userId: userId,
          id: { not: userTeamId },
          isSquad: false,
        },
        take: 5,
        select: {
          id: true,
          players: {
            select: {
              playerName: true,
            },
          },
        },
      });

      if (materialsPlayer.length === 0) {
        return res.status(404).json({ message: "강화재료가 없습니다." });
      }

      const materialIds = materialsPlayer.map((material) => material.id);

      await prisma.userTeams.deleteMany({
        where: {
          id: { in: materialIds },
        },
      });

      const randomValue = Math.random() * 100;

       // playerUpgrade 초기화
      let playerUpgrade = selectPlayer.playerUpgrade;

      let result;
      let upgradedStats = null; 

      if (randomValue < successRate) {
        const updatedUserTeam = await prisma.userTeams.update({
          where: { id: userTeamId },
          data: { playerUpgrade: { increment: 1 } },
          select: { playerUpgrade: true },
        });

        playerUpgrade = updatedUserTeam.playerUpgrade;

        const playerStats = await prisma.playerStats.findUnique({
          where: { playerId: playerId },
          select: {
            technique: true,
            pass: true,
            pace: true,
            agility: true,
            defense: true,
            finishing: true,
            stamina: true,
          },
        });

        if (playerStats) {
          upgradedStats = {
            technique: playerStats.technique + playerUpgrade,
            pass: playerStats.pass + playerUpgrade,
            pace: playerStats.pace + playerUpgrade,
            agility: playerStats.agility + playerUpgrade,
            defense: playerStats.defense + playerUpgrade,
            finishing: playerStats.finishing + playerUpgrade,
            stamina: playerStats.stamina + playerUpgrade,
          };
        }

        result = "강화 성공";
      } else if (randomValue < successRate + faultRate) {
        if (selectPlayer.playerUpgrade > 1) {
          await prisma.userTeams.update({
            where: {
              id: userTeamId,
            },
            data: {
              playerUpgrade: { decrement: 1 },
            },
          });
          result = "강화 실패";
        } else {
          result = "강화 실패 (레벨 유지)";
        }
      } else {
        await prisma.userTeams.delete({
          where: { id: userTeamId },
        });
        result = "강화 파괴";
      }

      return res.status(200).json({
        message: result,
        data: {
          playerName,
          playerUpgrade,
          successRate,
          faultRate,
          destroyRate,
          usedMaterials: materialsPlayer.map(
            (material) => material.players.playerName
          ),
          upgradedStats,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
