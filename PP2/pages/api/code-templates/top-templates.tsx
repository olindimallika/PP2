// code from chatgpt, asked it to get three templates from the database
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Define tags to fetch templates for
        const tags = ['Python', 'Java', 'JavaScript'];

        // Fetch one template for each tag
        const topTemplates = await Promise.all(
            tags.map(async (tag) =>
                prisma.template.findFirst({
                    where: {
                        tags: {
                            some: {
                                name: { equals: tag }, // Match the exact tag name
                            },
                        },
                    },
                    select: {
                        id: true, // Template ID
                        title: true, // Template title
                        explanation: true, // Template explanation
                        code: true, // Template code
                        tags: {
                            select: { name: true }, // Associated tags
                        },
                    },
                })
            )
        );

        // Filter out null results (if no template found for a tag)
        const filteredTemplates = topTemplates.filter((template) => template !== null);

        // Return the templates
        return res.status(200).json({ templates: filteredTemplates });
    } catch (error) {
        console.error('Error fetching top templates:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Error retrieving templates' });
    }
}
