import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

//이적 시장 등록
router.post('/transfermarket', authMiddleware, async (req, res, next) => {
    try {
        const { userTeamId, price } = req.body;
        const user = req.user;

        const marketPlace = await prisma.$transaction(async (tx) => {
            //삭제할 데이터가 있는지 확인 먼저 하자.
            const deletedTeams = await tx.userTeams.findUnique({
                where: {
                    id: userTeamId
                },
            });

            if (!deletedTeams) {
                throw new Error("해당 캐릭터가 존재하지 않습니다.");
            }

            if (deletedTeams.isSquad) {
                throw new Error("이미 팀 편성된 캐릭터입니다.")
            }

            if (deletedTeams.userId !== user.id) {
                throw new Error("다른 유저의 캐릭터입니다.")
            }

            const market = await tx.transferMarket.create({
                data: {
                    userTeamsId: deletedTeams.id,
                    price: price,
                },
            });

            return market;
        });

        return res.status(201).json({ data: marketPlace });
    } catch (err) {
        switch (err.message) {
            case "해당 캐릭터가 존재하지 않습니다.":
                return res.status(404).json({ error: "해당 캐릭터가 존재하지 않습니다." })
                break;
            case "이미 팀 편성된 캐릭터입니다.":
                return res.status(404).json({ error: "이미 팀 편성된 캐릭터입니다." })
                break;
            case "다른 유저의 캐릭터입니다.":
                return res.status(404).json({ error: "다른 유저의 캐릭터입니다." })
                break;
            default:
                next(err);
                break;
        }

    }
});

//이적 시장 구매
//user의 데이터를 받아오도록 하고
//이적 시장 내에서 구매하고자 하는 ID를 BODY로 받아온다.
router.post('/transfermarket/:marketId', authMiddleware, async (req, res, next) => {
    try {
        const { marketId } = req.params;
        const user = req.user;

        const purchased = await prisma.$transaction(async (tx) => {
            //돈이 있는지 검수한다.
            const userAccount = await tx.userAccount.findFirst({
                where: {
                    userId: user.id
                }
            })

            //먼저 경매장에서 제거한다.
            const deletedfromMarket = await tx.transferMarket.delete({
                where: {
                    id: parseInt(marketId, 10),
                },
            });

            if (userAccount.cash < deletedfromMarket.price) {
                throw new Error("돈이 부족합니다.");
            }

            if (!deletedfromMarket) {
                throw new Error("범위 외 접근입니다.");
            }

            //원래 판매자의 정보를 받아오도록 하자
            const soldedUser = await tx.userTeams.findUnique({
                where : {
                    id : parseInt(marketId,10)
                }
            });

            //판매자는 돈을 벌고
            await tx.userAccount.update({
                where: {
                    userId: soldedUser.userId
                },
                data: {
                    cash: {
                        increment: deletedfromMarket.price,
                    },
                },
            });

            //구매자와 판매자의 정보를 변경하면 된다.
            await tx.userTeams.update({
                where: {
                    id: deletedfromMarket.userTeamsId
                },
                data: {
                    userId: user.id
                }
            })


            //구매한 사람의 돈은 줄어든다.
            const purchasedUser = await tx.userAccount.update({
                where: {
                    userId: user.id
                },
                data: {
                    cash: {
                        decrement: deletedfromMarket.price
                    },
                },
            });


            return purchasedUser;
        });

        return res.status(201).json({ data: purchased });
    } catch (err) {
        switch (err.message) {
            case "돈이 부족합니다.":
                return res.status(404).json({ error: "돈이 부족합니다." });
                break;
            case "범위 외 접근입니다.":
                return res.status(404).json({ error: "범위 외 접근입니다." });
                break
            default:
                next(err);
                break;
        }

    }
});


//매물 목록 조회 = 전체 조회
router.get('/transfermarket', async (req, res, next) => {
    try {
        //유저 팀즈에서 마켓에 등록된 것들을 모두 가져온다.
        const marketList = await prisma.userTeams.findMany({
            where : {
                TransferMarket : {
                    isNot : null
                }
            },
            include: {
                TransferMarket: {
                    select : {
                        price : true
                    }
                }
            }
        });

        console.log(marketList);

        return res.status(201).json({ data: marketList });
    } catch (err) {
        next(err);
    }
});

//매물 검색 조회
router.get('/transfermarket/:playerId', async (req, res, next) => {
    try {
        const { playerId } = req.params;
        const playerPickUpToMarket = await prisma.userTeams.findMany({
            where: {
                playerId: parseInt(playerId, 10),
                TransferMarket: {
                    isNot : null
                }
            },
            include: {
                TransferMarket: {
                    select : {
                        price : true
                    }
                }
            }
        });

        return res.status(201).json({ data: playerPickUpToMarket });
    } catch (err) {
        next(err);
    }
});

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
                },
            });

            if (!cancelMarket) {
                throw new Error("잘못된 접근입니다.");
            }

            const currentUserTeam = await tx.userTeams.findUnique({
                where: {
                    id: cancelMarket.userTeamsId
                }
            })

            if (currentUserTeam.userId !== user.id) {
                throw new Error("다른 유저의 것입니다.");
            }




            //teams를 지우지 않으면 되니까 아예 별도의 로직은 필요 없다.

            return currentUserTeam;
        });
        //취소된 것은 그냥 바로 teams에 들어오면 되는 거 아닌가.
        return res.status(201).json({ data: cancelMarketAndPushTeams });
    } catch (err) {
        switch (err.message) {
            case "잘못된 접근입니다.":
                return res.status(404).json({ error: "잘못된 접근입니다." });
                break;
            case "다른 유저의 것입니다.":
                return res.status(404).json({ error: "다른 유저의 것입니다." });
                break
            default:
                next(err);

        }
    }
});

export default router;