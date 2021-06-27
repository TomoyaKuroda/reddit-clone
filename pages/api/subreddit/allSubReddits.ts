import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const allSubs = await prisma.subreddit.findMany()
        res.json(allSubs)
    } catch (e) {
        res.json(e)
    }
}