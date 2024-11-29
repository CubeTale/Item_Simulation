import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// 캐릭터 생성
router.post('/char-create', authMiddleware, async (req, res, next) => {
    try {
        const { nickname } = req.body;
        const { userId } = req.user;

        const isExistChar = await prisma.charaters.findFirst({
            where: { nickname }
        });

        if (isExistChar) {
            return res.status(409).json({ Message: '이미 존재하는 닉네임입니다.' })
        }

        const charater = await prisma.charaters.create({
            data: {
                userId: +userId,
                nickname: nickname,
                health: 500,
                power: 100,
                meso: 10000,
            }
        });
        return res.status(201).json({ data: '캐릭터가 정상적으로 생성되었습니다.' })
    } catch (err) {
        next(err);
    }
});

// 캐릭터 삭제
router.delete('/char-create/:charater_id', authMiddleware, async (req, res, next) => {
    const { charater_id } = req.params;

    const nickname = prisma.charaters.findUnique({
        where: {
            charater_id: +charater_id
        }
    });
    if (!nickname)
        return res.status(404).json({ message: '캐릭터가 존재하지 않습니다.' });

    await prisma.charaters.delete({where: {charater_id: +charater_id } });

    return res.status(200).json({ message: '캐릭터가 정상적으로 삭제되었습니다.' })
})

// 캐릭터 상세 조회(본인)
router.get('/char-create/:charater_id', authMiddleware, async (req, res, next) => {
    const { charater_id } = req.params;

    const charaterRead = await prisma.charaters.findFirst({
        where: { charater_id: +charater_id },
        select: {
            nickname: true,
            health: true,
            power: true,
            meso: true,
        }
    });
    return res.status(200).json({ data: charaterRead });
});

export default router;