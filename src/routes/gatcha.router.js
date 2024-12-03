import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import userAuth from '../middlewares/auth.middleware.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router();
const gatchaPay = 100;



//가챠 뽑기 API
router.post('/gatcha', async (req, res, next) => {
    try {
        //const players = await prisma.users.findMany({});

        //const userid = parseInt(req.userid, 10);
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
                            id : 3
                        }
                    },
                },

            })

            const updatedUser = await tx.userAccount.update({
                where : {
                    userId : 3
                },
                data: {
                    cash: {
                        decrement: gatchaPay
                    }
                }
            })

            if(updatedUser.cash < 0)
            {
                return res.status(404).json({ Message: ` No Money ` })
            }

            return [playerList[random_count], 100]
        })
        return res.status(200).json({ Message: ` ${playerName.playerName} 를 뽑았습니다. 잔액 ${cash} ` })
    }
    catch (err) {
        next(err);
    }


})

export default router;