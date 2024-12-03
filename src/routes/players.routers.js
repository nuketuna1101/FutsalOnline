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


// model Players {
//   id          Int          @id @default(autoincrement()) @map("id")
//   playerName  String       @map("playerName")
//   playerStats PlayerStats?
//   userTeams   UserTeams[]

//   @@map("Players")
// }

// model PlayerStats {
//   id        Int     @id @default(autoincrement()) @map("id")
//   playerId  Int     @unique @map("playerId")
//   technique Int     @default(0) @map("technique")
//   pass      Int     @default(0) @map("pass")
//   agility   Int     @default(0) @map("agility")
//   defense   Int     @default(0) @map("defense")
//   finishing Int     @default(0) @map("finishing")
//   stamina   Int     @default(0) @map("stamina")
//   players   Players @relation(fields: [playerId], references: [id], onDelete: Cascade)

//   @@map("PlayerStats")
// }


const router = express.Router();
/* TO DO */

router.post("/players", Authmiddleware,async (req,res)=>{
    const {playerName, playerStatus} = req.body;

    const player = prisma.$transaction(async (tx)=>{
      const player = await tx.players.create({
        playerName : playerName,
        PlayerStatus : playerStatus
      })
      const playerinfo = await prisma.playerStatus.create({
        data : {
          playerId : {
            
          }
        }
      })
      })
})

//선수 리스트에서 한명 검색
router.get("/players/:playerId", async (req, res, next) => {
  try {
    const { playerId } = req.params;
  } catch (err) {
    next(err);
  }
});

//선수 전체 리스트 조회
router.get("/players", async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

router.get("/players?userId", Authmiddleware, async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
export default router;
