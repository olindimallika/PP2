import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { templateId, modifiedCode, saveAsFork } = req.body as {
        templateId: number;
        modifiedCode?: string;
        saveAsFork?: boolean;
    };

    // Step 1: Find the template by `templateId`
    const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: { tags: true },
    });

    if (!template) {
        return res.status(404).json({ error: 'Template does not exist' });
    }

    // Step 2: Allow the visitor to view the template and modify it if they want to.
    // We will return the template's code to run or modify
    if (!saveAsFork) {
        // If not saving as a fork, just return the template with the modified code (if they want to run it)
        return res.status(200).json({
            message: 'Template ready for modification',
            template: {
                ...template,
                code: modifiedCode || template.code,
            },
        });
    }

    // Some of the try-catch block is done with Copilot autocomplete.
    // Below is only for authenticated users:--------------------------
    // Step 3: If the user wants to save the modified version as a new template, they must verify
    const decoded = verifyToken(req.headers.authorization || '');

    if (!decoded) {
        return res.status(401).json({ error: 'Please log-in to save modified template!' });
    }

    try {
        // Step 4: Save the modified code as a new, forked template (this is only allowed for authenticated users)
        const forkedTemplate = await prisma.template.create({
            data: {
                title: `${template.title} (Fork)`, // Add a "Fork" to the title.
                explanation: `Forked version of template ID ${templateId}`, // Description indicating it’s a fork.
                code: modifiedCode || template.code, // Save the modified code, or the original code if not modified
                isFork: true,
                forkedFromId: templateId,
                userId: decoded.userId, // Save under the authenticated user's ID
                tags: {
                    create: template.tags.map((tag) => ({ name: tag.name })), // Copy tags from the original template
                },
            },
            include: { tags: true },
        });

        // Step 5: Show if the process was successful with the forked template details
        return res.status(201).json({
            message: 'Template saved as a forked version!',
            template: forkedTemplate,
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error saving forked template:', error);
        return res.status(500).json({ error: 'Error saving forked template' });
    }
}
