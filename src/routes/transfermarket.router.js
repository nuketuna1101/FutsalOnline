import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

//이적 시장 등록
router.post('/transfermarket', authMiddleware, async (req, res, next) => {
    try {
        const { userTeamId, price } = req.body;
        const user = req.user;

        console.log(userTeamId, price);

        const marketPlace = await prisma.$transaction(async (tx) => {
            //삭제할 데이터가 있는지 확인 먼저 하자.
            const deletedTeams = await tx.userTeams.delete({
                where: {
                    id: userTeamId,
                    AND: {
                        userId: user.id,
                        isSquad: false
                    }
                }
            });

            if (!deletedTeams || deletedTeams.isSquad) {
                throw new Error("캐릭터에 접근할 수 없습니다.")
            }

            const market = await tx.transferMarket.create({
                data: {
                    userId: deletedTeams.userId,
                    playerId: deletedTeams.playerId,
                    price: price
                }
            })

            return market
        })

        return res.status(201).json({data : marketPlace})
    }
    catch (err) {
        next(err);
    }



})

//이적 시장 구매
//user의 데이터를 받아오도록 하고
//이적 시장 내에서 구매하고자 하는 ID를 BODY로 받아온다.
router.post('/transfermarket', authMiddleware, async (req, res, next) => {
    const { marketId } = req.body;
    const user = req.user;

    const parchased = await prisma.$transaction(async (tx) => {
        //먼저 경매장에서 제거한다.
        const deleted = await tx.transferMarket.delete({
            where: {
                id: marketId
            }
        })

        if (!deleted) {
            throw new Error("범위 외 접근입니다.")
        }

        const userAccount = await tx.userAccount.findFirst({
            where: {
                userId: user.id
            }
        })

        if (userAccount.cash < deleted.price) {
            throw new Error("돈이 부족합니다.")
        }

        //밑으로는 돈을 지불하고 플레이어를 영입한다.


        //삭제한 캐릭터를 teams에 집어 넣는다.
        const inputUserTeams = await tx.userTeams.create({
            data: {
                userId: user.id,
                playerId: deleted.playerId,
                isSquad: false,
            }
        })

        await tx.userAccount.update({
            where: {
                id: user.id
            },
            data: {
                cash: {
                    decrement: deleted.price
                }
            }
        })

    })

})


//매물 목록 조회
router.get('/transfermarket', authMiddleware, async (req, res, next) => {
    try {
        const marketList = await prisma.transferMarket.findMany({
            select: {
                id: true,
                userId : true,
                playerId: true,
                price: true
            }
        })


        return res.status(201).json({ data: marketList })
    }
    catch (err) {
        next(err)
    }
})

//매물 검색 조회
router.get('/transfermarket/:playerId', authMiddleware, async (req, res, next) => {
    try {
        const { playerId } = req.params;
        const playerPickUpToMarket = await prisma.transferMarket.findFirst({
            where: {
                playerId: playerId
            },
            select : {
                id : true,
                userId : true,
                playerId : true,
                price : true
            }
        })


        return res.status(201).json({ data: playerPickUpToMarket });
    }
    catch (err) {
        next(err);
    }
})

//등록된 매물 등록 취소
router.delete('/transfermarket', authMiddleware, async (req, res, next) => {
    try {
        const { transferMarketId } = req.body;
        const user = req.user;

        const cancelMarketAndPushTeams = await prisma.$transaction(async (tx) => {
            //먼저 마켓에서 꺼내오자.
            const cancelMarket = await tx.transferMarket.delete({
                where: {
                    id: transferMarketId,
                    AND: {
                        userId: user.id
                    }
                }
            })

            if (!cancelMarket) {
                throw new Error("잘못된 접근입니다.");
            }

            //throw new Error("체크용");

            //삭제된 걸 확인했다면 그 삭제된 데이터 가운데 하나를 테이블에 집어 넣도록 하자.

            const pushTeams = await tx.userTeams.create({
                data: {
                    userId: cancelMarket.userId,
                    playerId: cancelMarket.playerId
                }
            })

            return pushTeams;
        })
        //취소된 것은 그냥 바로 teams에 들어오면 되는 거 아닌가.

        return res.status(201).json({data : cancelMarketAndPushTeams})
    }
    catch (err) {
        next(err);
    }
})


export default router;