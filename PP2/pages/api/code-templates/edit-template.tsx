import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../utils/db";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let { id } = req.query;

    // Decode and verify the token before allowing the user to edit code template
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    if (req.method === 'PUT') {
        const { title, explanation, tags, code } = req.body as {
            title?: string;
            explanation?: string;
            tags?: string[];
            code?: string;
        };

        // Validate the template ID
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'Please try again.' });
        }

        // Ensure at least one field is provided for update
        if (!title && !explanation && !tags && !code) {
            return res.status(400).json({ message: 'Please fill at least one field to update.' });
        }

        try {
            // Find the code template by ID and update it
            const template = await prisma.template.update({
                where: {
                    id: Number(id),
                },
                data: {
                    ...(title && { title }),
                    ...(explanation && { explanation }),
                    ...(code && { code }),
                    tags: {
                        deleteMany: {}, // Delete old tags
                        create: tags?.map(tag => ({ name: tag })) || [] // Add new tags
                    },
                },
                include: { tags: true },
            });

            if (!template) {
                return res.status(404).json({ message: 'Code template not found.' });
            }

            // Return updated code template
            return res.status(200).json({ message: 'Code template successfully updated.', template });
        } catch (error) {
            console.error('Error updating code template:', error);
            return res.status(500).json({ error: 'Error updating code template.' });
        }
    // Following similar structure from create-blog.js
    } else if (req.method === 'DELETE') {
        try {
            // Validate the template ID
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ message: 'Invalid template ID.' });
            }

            // Delete associated tags before deleting the code template
            await prisma.templateTag.deleteMany({
                where: { templateId: Number(id) },
            });

            // Delete the code template itself
            await prisma.template.delete({
                where: { id: Number(id) },
            });

            return res.status(200).json({ message: 'Code template deleted successfully!' });
        } catch (error) {
            console.error('Error deleting code template:', error);
            return res.status(500).json({ error: 'Error deleting code template' });
        }
    } else {
        // Handle unsupported HTTP methods
        return res.status(405).json({ message: 'Method not allowed.' });
    }
}
