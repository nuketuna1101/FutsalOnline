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
router.post('/squads', async (req,res,next)=>{
    try{
        //const userid = req.userid;
        const testsquard = req.body;
        

        //squad에서 값을 다 가져오자.
        //유저의 squad 안에 있는 캐릭터 3개를 teams에서 찾아서 다시 squad에 들어가 삭제하자.
        //teams에서 소속된 친구들을 가져오도록 하자.
        //팀즈에서 데이터들을 가져오자.
        //팀즈 안에서 index 값에 해당하는 애들을 추가하도록 하자.
        //일단은 players list에서 먼저 받아오고 그 다음에 데이터가 채워지면 teams에서 받아오도록 하자.
        const squadTransaction = await prisma.$transaction(async (tx)=>{
            const allSquard = await tx.userSquads.findMany({});
            let squad_list = [];
            for(let i = 0;i<allSquard.length;i++)
            {
                squad_list.push(allSquard[i].userTeamId);
            }

            console.log(squad_list);
            let re_list = [];

            for(let i = 0;i<squad_list.length;i++)
            {
                const squadedCharacter = await tx.userTeams.findFirst({
                    where : {
                        userId : 3,
                        id : squad_list[i]
                    }
                })
                re_list.push(squadedCharacter);
            }

            console.log(re_list);

            const deletedSquad = await tx.userSquads.deleteMany({
                where : {
                    userTeamId : {
                        in : squad_list
                    }
                }
            })

            const currentTeamSqard = await tx.userTeams.findMany({
                where : {
                    userId : 3 //나중에 userid를 받아서 그걸로 바꾸도록 하자.
                }
            });
            for(let i of Object.values(testsquard))
            {
                await tx.userSquads.create({
                    data : {
                        userteam : {
                            connect : {
                                id : i
                            }
                        }
                    }
                })
            }

            

            

            return [currentTeamSqard];
        })

        // if(!squadTransaction)
        // {
            
        //     return res.status(404).json({message : "값이 없음"})
        // }
        // else
        // {
        //     console.log(squadTransaction)
        //     return res.status(200).json({message : "스쿼드 선발 완료!"})
        // }

        
        return res.status(200).json({message : squadTransaction})
        
    }
    catch(err){
        next(err);
    }
})
/* TO DO */

export default router;