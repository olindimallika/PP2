import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { titleQuery, explanationQuery, tagQuery, page = 1, pageSize = 10 } = req.body as {
        titleQuery?: string;
        explanationQuery?: string;
        tagQuery?: string;
        page?: number;
        pageSize?: number;
    };

    // Ensure at least one search field is provided
    if (!titleQuery && !explanationQuery && !tagQuery) {
        return res.status(400).json({ error: 'At least one search field must be filled.' });
    }

    try {
        // Parse page and pageSize values, ensure they are valid numbers
        const pageNum = parseInt(page.toString(), 10) || 1;
        const pageSizeNum = parseInt(pageSize.toString(), 10) || 10;
        const skip = (pageNum - 1) * pageSizeNum;

        // Build the search query dynamically
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
            ].filter(Boolean), // Remove null entries
        };

        // Fetch total count of matching templates
        const totalItems = await prisma.template.count({
            where: whereClause,
        });

        // Fetch paginated templates
        const templates = await prisma.template.findMany({
            where: whereClause,
            skip,
            take: pageSizeNum,
            select: {
                id: true, // Template ID
                title: true, // Template title
                explanation: true, // Template explanation
                code: true, // Template code
                tags: {
                    select: { name: true }, // Associated tags
                },
            },
        });

        const totalPages = Math.ceil(totalItems / pageSizeNum);

        // Return paginated search results
        return res.status(200).json({
            codeTemplates: templates,
            currentPage: pageNum,
            totalPages,
        });
    } catch (error) {
        console.error('Error retrieving templates:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Error retrieving templates' });
    }
}
