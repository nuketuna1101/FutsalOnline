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
       // 중복 확인: playerName이 이미 존재하는지 검사
       const existingPlayer = await prisma.players.findFirst({
        where: {
          playerName: player.playerName, 
        },
      });

      // 중복된 경우 건너뛰기
      if (existingPlayer) {
        console.log(`중복된 선수: ${player.playerName}, 건너뜀`);
        continue; 
      }

      // 플레이어 정보 삽입
      const newPlayer = await prisma.players.create({
        data: {
          playerName: player.playerName, 
        },
      });

      // PlayerStats 정보 삽입
      await prisma.playerStats.create({
        data: {
          playerId: newPlayer.id,
          technique: parseInt(player.technique || 0),
          pass: parseInt(player.pass || 0),
          pace: parseInt(player.pace || 0),
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

// 유저가 가지고 있는 선수 조회
router.get("/players/my", Authmiddleware, async (req, res, next) => {
  try {
    console.log("Authenticated User Object:", req.user); 

    const userId = req.user.id; 
    console.log("User ID:", userId); 

    const teamPlayers = await prisma.userTeams.findMany({
      where: {
        userId: +userId,
      },
      include: {
        players: {
          select: {
            playerName: true,
            playerStats: {
              select: {
                technique: true,
                pass: true,
                pace: true,
                agility: true,
                defense: true,
                finishing: true,
                stamina: true,
              },
            },
          },
        },
      },
    });

    if(teamPlayers.length === 0) {
      return res.status(404).json({ error: "가지고 있는 선수가 존재하지 않습니다." });
    }

    return res.status(200).json({ data: teamPlayers });
  } catch (err) {
    console.error("Error in /players/my:", err);
    next(err);
  }
});

//선수 전체 리스트 조회
router.get("/players", async (req, res, next) => {
  try {
    const players = await prisma.players.findMany({
      select: {
        playerName: true,
        playerStats: {
          select: {
            technique: true,
            pass: true,
            agility: true,
            defense: true,
            finishing: true,
            stamina: true,
            pace: true,
          },
        },
      },
    });

    if (!players) {
      return res.status(404).json({ error: "선수가 존재하지 않습니다." });
    }

    return res.status(200).json({ data: players });
  } catch (err) {
    next(err);
  }
});

//선수 리스트에서 한명 검색
router.get("/players/:playerId", async (req, res, next) => {
  try {
    console.log("Received playerId:", req.params.playerId);

    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({ error: "playerId가 제공되지 않았습니다." });
    }

    //유니크 아이디 값으로 선수 아이디 검색
    const player = await prisma.players.findFirst({
      where: {
        id : +playerId,
      },
      select: {
        playerName: true,
        playerStats: {
          select: {
            technique: true,
            pass: true,
            agility: true,
            defense: true,
            finishing: true,
            stamina: true,
            pace: true,
          },
        },
      },
    });

    if (!player || !player.playerStats) {
      return res.status(404).json({ error: "선수가 존재하지 않거나 스탯 정보가 없습니다." });
    }

    return res.status(200).json({ data: player });
  } catch (err) {
    next(err);
  }
});

export default router;
