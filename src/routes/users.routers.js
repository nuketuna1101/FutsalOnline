//====================================================================================================================
//====================================================================================================================
// src/routes/users.router.js
// 유저 api 라우터
//====================================================================================================================
//====================================================================================================================

import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import userAuth from '../middlewares/auth.middleware.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const router = express.Router();



const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hashedPassword) => await bcrypt.compare(password, hashedPassword);

router.post('/sign-up', async (req, res) => {
    try {
        const { username,nickname, password } = req.body;
        const configPassword = /[a-zA-Z0-9]{6,29}/;

        if (!configPassword.test(password)) {
            throw new Error("비밀번호가 잘못되었습니다.")
        }



        const inputPassword = await hashPassword(password);

        const user = await prisma.users.create({
            data : {
                userName : username,
                nickname : nickname,
                password : inputPassword,
            }
        })

        return res.status(201).json({data : "유저 생성"});

    }
    catch (err) {
        return res.status(404).json({data : err});
    }


})


router.get('/sign-in', async (req, res) => {
    try {
        const { username, password } = req.body;
        const count = req.query.check;

        //const configPassword = /[a-zA-Z0-9]{6,29}/;

        const user = await prisma.users.findFirst({
            where : {
                userName : username
            }
        })



        

        if(!user)
        {
            return res.status(404).json({err : "유저가 없음"});
        }
        else if(!verifyPassword(user.password,password))
        {
            return res.status(404).json("비밀번호 틀림");
        }
        

        const token = Jwt.sign(
            {
              userId: user.nickname,
            },
            process.env.SESSION_SECRET_KEY,
          );
      
        res.cookie('authorization', `Bearer ${token}`);

        return res.status(201).json({data : "로그인 성공"});

    }
    catch (err) {
        return res.status(404).json({error : err});
    }


})

router.get('/users', async (req,res) => {
    try
    {
        const userlist = await prisma.users.findMany({});
        console.log(userlist);
    
        return res.status(201).json({data : "확인"});
    
    }
    catch(err)
    {
        return res.status(404).json({data : err});
    }
    
})








export default router;