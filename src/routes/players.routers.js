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

const router = express.Router();
/* TO DO */

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

router.get("/players?userId = my", Authmiddleware, async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});
export default router;
