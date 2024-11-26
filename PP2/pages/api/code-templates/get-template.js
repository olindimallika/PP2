//for fetching a single template by id, for pressing links of blog posts (maybe forking as well).
import prisma from '../../../utils/db';

export default async function handler(req, res) {
    // allow only GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    // make sure the template ID is provided
    if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
    }

    try {
        // Fetch the template with the given ID
        const template = await prisma.template.findUnique({
            where: {
                id: parseInt(id, 10),
            },
            select: {
                id: true,
                title: true,
                explanation: true,
                code: true,
                tags: {
                    select: {
                        name: true,
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
        console.error('Error fetching template:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
