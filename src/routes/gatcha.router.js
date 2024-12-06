import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router();
const gatchaPay = 100;



//가챠 뽑기 API
router.post('/gatcha',authMiddleware, async (req, res, next) => {
    try {
        //const players = await prisma.users.findMany({});
        //유저 정보를 전부 받아온 다음
        //user의 id를 parse하자.
        const user = req.user;
        let [playerName, cash] = await prisma.$transaction(async (tx) => {
            let playerList = await tx.players.findMany({

            });

            let random_count = Math.floor(Math.random() * playerList.length);


            let userteam = await tx.userTeams.create({
                data: {
                    players : {
                        connect : {
                            id : playerList[random_count].id
                        }
                    },
                    user : {
                        connect : {
                            id : user.id
                        }
                    },
                },

            })

            const updatedUser = await tx.userAccount.update({
                where : {
                    userId : user.id
                },
                data: {
                    cash: {
                        decrement: gatchaPay
                    }
                }
            })

            if(updatedUser.cash < 0)
            {
                return res.status(400).json({ Message: ` No Money ` })
            }

            return [playerList[random_count], updatedUser.cash]
        })
        return res.status(200).json({ Message: `${playerName.playerName} has been selected. Remaining balance: ${cash}` });
    }
    catch (err) {
        next(err);
    }


})

export default router;