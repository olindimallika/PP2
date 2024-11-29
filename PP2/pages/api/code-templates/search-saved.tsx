import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../utils/db";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Decode and verify the token before allowing the user to access code templates
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    // For viewing saved code templates
    if (req.method === 'GET') {
        const { userId, page = 1, pageSize = 10} = req.query;

        // Validate user ID
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Please provide a valid user ID.' });
        }

        try {
            // Parse page and pageSize values, ensure they are valid numbers
            const pageNum = parseInt(page.toString(), 10) || 1;
            const pageSizeNum = parseInt(pageSize.toString(), 10) || 10;
            const skip = (pageNum - 1) * pageSizeNum;

            const whereClause = {
                userId: Number(userId),
            }

            // Fetch total count of matching templates
            const totalItems = await prisma.template.count({
                where: whereClause,
            });

            // Access a user's saved templates through their user ID
            const savedTemplates = await prisma.template.findMany({
                where: whereClause,
                skip,
                take: pageSizeNum,
                select: {
                    id: true, // Template ID
                    title: true, // Template title
                    explanation: true, // Template explanation
                    code: true, // Template code
                    tags: true, // Associated tags
                },
            });

            const totalPages = Math.ceil(totalItems / pageSizeNum);

            return res.status(200).json({ savedTemplates: savedTemplates, currentPage: pageNum, totalPages });
        } catch (error) {
            console.error('Error fetching saved templates:', error); // Log the error for debugging
            return res.status(500).json({ message: 'Error fetching saved templates.' });
        }

    // For searching through saved code templates
    } else if (req.method === 'POST') {
        const { userId } = req.query;
        const { titleQuery, explanationQuery, tagQuery, page = 1, pageSize = 10 } = req.body as {
            titleQuery?: string;
            explanationQuery?: string;
            tagQuery?: string;
            page?: number;
            pageSize?: number;
        };

        // Validate search fields
        if (!titleQuery && !explanationQuery && !tagQuery) {
            return res.status(400).json({ error: 'At least one search field must be filled.' });
        }

        // Validate user ID
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Please provide a valid user ID.' });
        }

        try {
            // Parse page and pageSize values, ensure they are valid numbers
            const pageNum = parseInt(page.toString(), 10) || 1;
            const pageSizeNum = parseInt(pageSize.toString(), 10) || 10;
            const skip = (pageNum - 1) * pageSizeNum;

            // Allow a user to search through their saved templates by title, explanation, or tags
            // Followed similar structure from search.js
            const whereClause = {
                    OR: [
                        titleQuery ? { title: { contains: titleQuery } } : null,
                        explanationQuery ? { explanation: { contains: explanationQuery } } : null,
                        tagQuery
                            ? {
                                tags: {
                                    some: {
                                        name: { contains: tagQuery },
                                    },
                                },
                            }
                            : null,
                    ].filter(Boolean),
                };

            // Fetch total count of matching templates
            const totalItems = await prisma.template.count({
                where: {
                    AND: [
                        { userId: Number(userId) },
                        whereClause,
                    ],
                },
            });

            const savedTemplates = await prisma.template.findMany({
                where: whereClause,
                skip,
                take: pageSizeNum,
                select: {
                    id: true, // Template ID
                    title: true, // Template title
                    explanation: true, // Template explanation
                    code: true, // Template code
                    tags: true, // Associated tags
                },
            });

            const totalPages = Math.ceil(totalItems / pageSizeNum);

            return res.status(200).json({ savedTemplates: savedTemplates, currentPage: pageNum, totalPages });
        } catch (error) {
            console.error('Error searching templates:', error); // Log the error for debugging
            return res.status(500).json({ message: 'Error searching templates.' });
        }
    } else {
        // Handle unsupported HTTP methods
        res.status(405).json({ message: 'Method not allowed.' });
    }
}
