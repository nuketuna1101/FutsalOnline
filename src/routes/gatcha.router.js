import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import userAuth from '../middlewares/auth.middleware.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router();
const gatchaPay = 100;



//가챠 뽑기 API
router.post('/gatcha', async (req, res) => {
    try {
        const userid = parseInt(req.userid, 10);
        let [playerName, cash] = await prisma.$transaction(async (tx) => {
            let playerList = await tx.players.findMany({

            });

            let random_count = Math.floor(Math.random() * playerList.length);


            let userteam = await tx.userTeams.create({
                data: {
                    userId: {
                        connect : {
                            id : 1
                        }
                    },
                    playerId: playerList[random_count].id
                }

            })

            const updatedUser = await tx.userAccount.update({
                where: {
                    id: userid
                },
                data: {
                    cash: {
                        decrement: gatchaPay
                    }
                }
            })

            return [playerList[random_count].playerName, updatedUser.cash]
        })





        return res.status(200).json({ Message: ` ${playerName} 를 뽑았습니다. 잔액 ${cash} ` })
    }
    catch (err) {
        next(err);
    }


})

export default router;