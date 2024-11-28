import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { templateId } = req.query;

        // Ensure templateId is provided and is a valid number
        if (!templateId || isNaN(Number(templateId))) {
            return res.status(400).json({ error: 'Invalid or missing templateId.' });
        }

        // Get all associated blog posts for a given code template ID
        try {
            const template = await prisma.template.findUnique({
                where: {
                    id: Number(templateId),
                },
                // From GPT, asked how to generate associated blog posts of a given code template
                include: {
                    blogPosts: {
                        select: {
                            id: true, // Blog post ID
                            title: true, // Blog post title
                            description: true, // Blog post description
                            isHidden: true, // Hidden status
                            tags: true, // Associated tags
                        },
                    },
                },
            });

            if (!template) {
                return res.status(404).json({ error: 'Template not found.' });
            }

            return res.status(200).json({ template });
        } catch (error) {
            console.error('Error retrieving blog posts:', error); // Log the error for debugging
            return res.status(500).json({ error: 'Error retrieving blog posts.' });
        }
    } else {
        // Handle unsupported HTTP methods
        return res.status(405).json({ error: 'Method not allowed.' });
    }
}
