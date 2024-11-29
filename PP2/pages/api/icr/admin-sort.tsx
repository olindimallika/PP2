// In /api/icr/admin-sort.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from "../../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized user or invalid token. Please log in!' });
    }

    if (verifiedUser.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        // In /api/icr/admin-sort.ts
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                reports: {
                    some: {},
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                reports: {
                    select: {
                        reason: true
                    }
                },
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: {
                reports: {
                    _count: 'desc',
                },
            },
        });

        const comments = await prisma.comment.findMany({
            where: {
                reports: {
                    some: {},
                },
            },
            select: {
                id: true,
                content: true,
                blogPostId: true,
                reports: {
                    select: {
                        reason: true
                    }
                },
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: {
                reports: {
                    _count: 'desc',
                },
            },
        });

        return res.status(200).json({ blogPosts, comments });
    } catch (error) {
        console.error('Error retrieving sorted data:', error);
        return res.status(500).json({ error: 'Error retrieving sorted data.' });
    }
}
