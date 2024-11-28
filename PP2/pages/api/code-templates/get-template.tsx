import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // allow only GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    // make sure the template ID is provided
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'Template ID is required and must be a valid number' });
    }

    try {
        // Fetch the template with the given ID
        const template = await prisma.template.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true, // Template ID
                title: true, // Template title
                explanation: true, // Explanation of the template
                code: true, // The code of the template
                tags: {
                    select: {
                        name: true, // Tags associated with the template
                    },
                },
            },
        });

        // if no template is found, then return a 404 error
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // return the template data
        return res.status(200).json({ template });
    } catch (error) {
        console.error('Error fetching template:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Internal server error' });
    }
}
