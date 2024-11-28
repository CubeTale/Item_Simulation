import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from "../middlewares/auth.middleware.js";
import { Prisma } from "@prisma/client";

const router = express.Router();

// 회원가입
router.post('/sign-up', async(req, res, next) => {
    try{
        const { playerId, password, name, gender, age } = req.body;

        const isExistUser = await prisma.users.findFirst({
            where: { playerId }
        });

        if(isExistUser){
            return res.status(409).json({ Message: '이미 존재하는 아이디입니다.' })
        }

        if(password.length <= 5){
            return res.status(401).json({ Message: '비밀번호는 6자리 이상이어야 합니다.' })
        }

        const hashedPassword = await bcrypt.hash(password, 6);

        const [user, userInfo] = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    playerId,
                    password: hashedPassword
                }
            });

            const userInfo = await tx.userInfos.create({
                data: {
                    userId: user.userId,
                    name,
                    age,
                    gender,
                }
            });
            
            return [user, userInfo];
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });

        return res.status(201).json({ Message: '회원가입이 성공적으로 완료되었습니다.' })
    } catch (err) {
        next(err);
    }
});

// 로그인
router.post('/login', async(req, res, next) => {
    const { playerId, password } = req.body;

    const user = await prisma.users.findFirst({where: {playerId}});

    if(!user)
        return res.status(401).json({ Message: '존재하지 않는 아이디입니다.' });
    if((await bcrypt.compare(password, user.password)))
        return res.status(401).json({ Message: '비밀번호가 일치하지 않습니다.' })

        req.session.userId = user.userId;
    const token = jwt.sign(
        {
            userId: user.userId,
        },
            'customized-secret-key',
        {
            expiresIn: '30m'
        }
    );
        
    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ Message: '로그인에 성공하였습니다.' })
});

// 아이디 조회
router.get('/users', authMiddleware, async(req, res, next) => {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
        where: { userId: +userId },
        select: {
            userId: true,
            playerId: true,
            createdAt: true,
            updatedAt: true,
            userInfos: {
                select: {
                    name: true,
                    age: true,
                    gender: true
                }
            }
        }
    });

    return res.status(200).json({ data: user });
})

export default router;