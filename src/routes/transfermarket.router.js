import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

//이적 시장 등록
router.post('/transfermarket', authMiddleware, async (req,res,next)=>{
    try
    {
        const {userTeamId,price} = req.body;
        const user = req.user;

        const marketPlace = await prisma.$transaction(async (tx)=>{
            const deletedTeams = await tx.userTeams.delete({
                where : {
                    id : userTeamId,
                    AND : {
                        userId : user.id,
                        isSquad : false
                    }
                }
            });

            if(!deletedTeams || deletedTeams.isSquad)
            {
                throw new Error("캐릭터에 접근할 수 없습니다.")
            }

            const market = await tx.transferMarket.create({
                data : {
                    userId : deletedTeams.userId,
                    playerId : deletedTeams.playerId,
                    price : price
                }
            })

            return market
        })
    }
    catch(err)
    {
        next(err);
    }



})

//이적 시장 구매
//user의 데이터를 받아오도록 하고
router.post('/transfermarket', authMiddleware, async (req,res,next)=>{
    const {userTeamId} = req.userTeamId;

})


//매물 목록 조회
router.get('/transfermarket', authMiddleware, async (req,res,next)=>{
    
})

//매물 검색 조회
router.get('/transfermarket/:playerId', authMiddleware, async (req,res,next)=>{
    
})

//등록된 매물 등록 취소
router.delete('/transfermarket', authMiddleware, async (req,res,next)=>{
    const {playerId} = req.playerId;
    //취소된 것은 그냥 바로 teams에 들어오면 되는 거 아닌가.
})


export default router;