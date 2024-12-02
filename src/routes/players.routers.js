//====================================================================================================================
//====================================================================================================================
// src/routes/players.router.js
// 선수 데이터 불러오기 (CSV TO JSON)
// 선수 검색 - GET/api/players/:playerId
// 선수 전체 목록 조회 - GET/api/players
// 내가 가진 선수 목록 조회 - GET/api/players?userId=my
//====================================================================================================================
//====================================================================================================================

import express from "express";
import { prisma } from "../utils/prisma/index.js";
import Authmiddleware from "../middlewares/auth.middleware.js";
//check csv to json
import csvToJson from "../public/csvToJson";
const router = express.Router();
/* TO DO */

//선수 데이터 csv to json
router.post("/upload", async (req, res) => {
  try {
    // CSV 파일 경로를 지정하세요
    const filePath = "./data/players.csv";
    const jsonData = await csvToJson(filePath);

    // 데이터 삽입
    for (const player of jsonData) {
      // 플레이어 정보 삽입
      const newPlayer = await prisma.players.create({
        data: {
          // CSV의 playerName 열
          playerName: player.playerName,
        },
      });

      // PlayerStats 정보 삽입
      await prisma.playerStats.create({
        data: {
          playerId: newPlayer.id,
          technique: parseInt(player.technique || 0),
          pass: parseInt(player.pass || 0),
          agility: parseInt(player.agility || 0),
          defense: parseInt(player.defense || 0),
          finishing: parseInt(player.finishing || 0),
          stamina: parseInt(player.stamina || 0),
        },
      });
    }

    res.status(200).send("CSV TO JSON Success");
  } catch (error) {
    res.status(500).send("Error");
  }
});

//선수 리스트에서 한명 검색
router.get("/players/:playerId", async (req, res, next) => {
  try {
    const { playerId } = req.params;

    const player = await prisma.players.findUnique({
      where: {
        //bigint때문에 +가 안됨
        id: +playerId,
      },
      include: {
        playerStats: true,
      },
    });

    if (!player) {
      return res.status(404).json({ error: "선수가 존재하지 않습니다. " });
    }

    return res.status(200).json({ data: player });
  } catch (err) {
    res.status(500).send("Error");
  }
});

//선수 전체 리스트 조회
router.get("/players", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

//쿼리문은 어떤식으로 표현하는지 물어보기
router.get("/players?userId = my", Authmiddleware, async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
export default router;
