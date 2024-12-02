//====================================================================================================================
//====================================================================================================================
// src/routes/sqauds.router.js
// 
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import userAuth from '../middlewares/auth.middleware.js'


const router = express.Router();

//스쿼드를 구성하는 API
router.post('/squads', userAuth, async (req,res)=>{
    try{
        const userid = req.userid;
        const playerIndexData = req.body;

        const squadTransaction = await prisma.$transaction(async (tx)=>{
            for(let playerIndex of playerIndexData)
            {
                await tx.userSquads.create({
                    data : {
                        playerId : playerIndex
                    }
                })
            }
        })
        
        return res.status(200).json({message : "스쿼드 선발 완료!"})
    }
    catch(err){
        next(err);
    }
})
/* TO DO */

export default router;