import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

router.post('/transfermarket', authMiddleware, (req,res,next)=>{

})