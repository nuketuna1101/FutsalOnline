//====================================================================================================================
//====================================================================================================================
// src/routes/users.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import user_auth from '../middlewares/auth.middleware.js'

const router = express.Router();

router.post('/gatcha',user_auth, async (req, res) => {
    try {
        let playerGatchaInfo = await prisma.$transaction(async (tx)=>{
            let playerList = await tx.players.findMany({

            });
    
            let random_count = Math.floor(Math.random() * playerList.length);
            
            
        })


        



    }
    catch (err) {
        next(err);
    }


})


export default router;