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

// model UserSquads {
//     id         Int       @id @default(autoincrement()) @map("id")
//     userTeamId Int       @map("userTeamId")
//     userteam   UserTeams @relation(fields: [userTeamId], references: [id], onDelete: Cascade)
  
//     @@index([userTeamId], map: "UserSquads_userTeamId_fkey")
//     @@map("UserSquads")
//   }


//스쿼드를 구성하는 API
//인증 미들웨어에서 userid를 받아온다.
//body에서 각각의 index를 받아온다.
//userteams는 여러 개를 추가할 수 있겠다.
//userSquad에는 각 유저 당 3개만 들어갈 수 있도록 한다.
//이미 스쿼드가 등록된 경우에는 마지막 Squad를 수정하도록 한다.
router.post('/squads', async (req,res)=>{
    try{
        //const userid = req.userid;
        const {index1, index2, index3} = req.body;


        //teams에서 소속된 친구들을 가져오도록 하자.
        // const squadTransaction = await prisma.$transaction(async (tx)=>{
        //     const currentTeamSqard = await tx.userSquads.findMany({});


        //     const currentTeam = await tx.userTeams.findMany({
        //         where : {
                    
        //         }
        //     });


        // })
        
        return res.status(200).json({message : "스쿼드 선발 완료!"})
    }
    catch(err){
        next(err);
    }
})
/* TO DO */

export default router;