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

      // CSV 데이터에서 해당 강화 레벨(index)에 해당하는 확률 데이터 찾기
      const upgradeData = jsonData.find(
        (row) => parseInt(row.index) === currentUpgradeLevel
      );

      if (!upgradeData) {
        return res.status(404).json({ message: `강화 레벨 ${currentUpgradeLevel}에 대한 데이터가 없습니다.` });
      }

      // 강화 확률 정보
      const successRate = upgradeData.success;
      const faultRate = upgradeData.fault;
      const destroyRate = upgradeData.destroy;

      //강화 재료는 선수로 갯수 제한은 1~5개 -> ovr기준으로 정렬하고 할려면
      const materialsPlayer = await prisma.userTeams.findMany({
        where: {
          userId: userId,
          // 현재 선수 제외
          id: { not: userTeamId },
          // 선발 된 선수 제외
          isSquad: false,
        },
        // 최대 5개의 선수 선택
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

      // 재료 선수 ID 목록
      const materialIds = materialsPlayer.map((material) => material.id);

      // 재료 선수 삭제
      await prisma.userTeams.deleteMany({
        where: {
          id: { in: materialIds },
        },
      });
      // 랜덤 값 생성 (0~99)
      const randomValue = Math.random() * 100;

      // 강화 결과 결정
      let result;
      if (randomValue < successRate) {
        // 강화 성공: 강화 레벨 증가
        await prisma.userTeams.update({
          where: { id: userTeamId },
          data: { playerUpgrade: { increment: 1 } },
        });
        result = "강화 성공";
      } else if (randomValue < successRate + faultRate) {
        // 강화 실패: 강화 레벨 다운 but 1랭크이면 1유지
        if(selectPlayer.playerUpgrade > 1){
          await prisma.userTeams.update({
            where: {
              id: userTeamId,
            },
            data: {
              playerUpgrade: { decrement: 1 }
            },
          });
          result = "강화 실패";
        }
      } else {
        // 강화 파괴: 선수 삭제
        await prisma.userTeams.delete({
          where: { id: userTeamId },
        });
        result = "강화 파괴";
      }

      return res.status(200).json({
        message: result,
        data: {
          playerName,
          successRate,
          faultRate,
          destroyRate,
          usedMaterials: materialsPlayer.map(
            (material) => material.players.playerName
          ),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
