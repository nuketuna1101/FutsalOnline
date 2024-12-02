//====================================================================================================================
//====================================================================================================================
// src/routes/users.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import userAuth from '../middlewares/auth.middleware.js'

const router = express.Router();
const gatchaPay = 100;
// model UserSquads { 
//     id          BigInt    @id @default(autoincrement())   @map("id")
//     userTeamId  BigInt    @map("userTeamId")
    
//     userteam UserTeams @relation(fields: [userTeamId],references: [id], onDelete: Cascade, onUpdate: Cascade)
//     @@map("UserSquads")
//   }

// model UserTeams {
//     id        BigInt    @id @default(autoincrement())   @map("id")
//     userId    BigInt    @map("userId")
//     playerId  BigInt    @map("playerId")
  
//     userSquads UserSquads[]
//     user       Users        @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
//     players    Players      @relation(fields: [playerId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  
//     @@map("UserTeams")
//   }

//가챠 뽑기 API
router.post('/gatcha',userAuth, async (req, res) => {
    try {
        const userid = parseInt(req.userid,10);
        let [playerName,cash] = await prisma.$transaction(async (tx)=>{
            let playerList = await tx.players.findMany({

            });
    
            let random_count = Math.floor(Math.random() * playerList.length);
            
            
            let userteam = await tx.userTeams.create({
                data : {
                    userId : userid,
                    playerId : playerList[random_count].id
                }
                
            })

            const updatedUser = await tx.userAccount.update({
                where : {
                    id : userid
                },
                data : {
                    cash : {
                        decrement : gatchaPay
                    }
                }
            })
            
            return [playerList[random_count].playerName, updatedUser.cash]
        })


        


        return res.status(200).json({Message : ` ${playerName} 를 뽑았습니다. 잔액 ${cash} ` })
    }
    catch (err) {
        next(err);
    }


})

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
        
    }
    catch(err){
        next(err);
    }
})


export default router;