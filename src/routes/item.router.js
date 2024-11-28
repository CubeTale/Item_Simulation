import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 아이템 생성
router.post('/item-create', async (req, res, next) => {
    const { item_name, item_stat, item_price } = req.body;

    const isExistItem = await prisma.items.findFirst({
        where: { item_name }
    });

    if (isExistItem) {
        return res.status(409).json({ Message: '이미 존재하는 아이템입니다.' })
    }

    const item = await prisma.items.create({
        data: {
            item_name: item_name,
            item_stat: Object().item_stat,
            item_price: item_price
        }
    });
    return res.status(201).json({ data: item })
});

// 아이템 정보 수정
router.put('/item-create/:item_code', async (req, res, next) => {
    const { item_code } = req.params;
    const { item_name, item_stat } = req.body;

    const item = await prisma.items.findFirst({
        where: { item_code }
    });

    if (!item)
        return res.status(404).json({ message: '아이템이 존재하지 않습니다.' })

    await prisma.items.update({
        data: {
            item_name: item_name,
            item_stat: Object().item_stat
        },
        where: {
            item_code: +item_code,
        }
    });

    return res.status(200).json({ data: '아이템이 수정되었습니다.' })
});

// 아이템 목록 조회
router.get('/item-create', async(req, res, next) => {
    const item = await prisma.items.findMany({
        select: {
            item_code: true,
            item_name: true,
            item_price: true,
        }
    });
    
    return res.status(200).json({ data: item });
})

// 아이템 상세 조회
router.get('/item-create/:item_code', async(req, res, next) => {
    const item = await prisma.items.findFirst({
        select: {
            item_code: true,
            item_name: true,
            item_stat: true,
            item_price: true,
        }
    });

    return res.status(200).json({ data: item });
})

export default router