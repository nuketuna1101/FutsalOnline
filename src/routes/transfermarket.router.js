import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

//이적 시장 등록
router.post('/transfermarket', authMiddleware, (req,res,next)=>{
    const {userTeamId} = req.userTeamId;



})

//이적 시장 구매
router.post('/transfermarket', authMiddleware, (req,res,next)=>{
    const {userTeamId} = req.userTeamId;

})


//매물 목록 조회
router.get('/transfermarket', authMiddleware, (req,res,next)=>{
    
})

//매물 검색 조회
router.get('/transfermarket/:playerId', authMiddleware, (req,res,next)=>{
    
})

//등록된 매물 등록 취소
router.delete('/transfermarket', authMiddleware, (req,res,next)=>{
    const {playerId} = req.playerId;
    //취소된 것은 그냥 바로 teams에 들어오면 되는 거 아닌가.
})