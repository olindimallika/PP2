import prisma from "../../../utils/db";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req, res) {
    // decode and verify the token before allowing the user to edit code template
    const verifiedUser = verifyToken(req.headers.authorization);

    if (!verifiedUser) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }        
    
    // for viewing saved code templates
    if (req.method === 'GET') {
        const { userId } = req.query;
        
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Please provide a user ID.' });
        }

        // access a user's saved templates through their user id
        const savedTemplates = await prisma.template.findMany({
            where: {
                userId: Number(userId),
            },
            select: {
                id: true,
                title: true,
                explanation: true,
                code: true,
                tags: true,
            },
        })

        return res.status(200).json({ savedTemplates });

    // for searching through saved code templates
    } else if (req.method === 'POST') {
        const { userId } = req.query;
        const { titleQuery, explanationQuery, tagQuery } = req.body;

        if (!titleQuery && !explanationQuery && !tagQuery) {
            return res.status(400).json({ error: 'At least one search field must be filled.' });
        }

        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ message: 'Please provide a user ID.' });
        }

        // allow a user to search through their saved templates by title, explanation, or tags
        // followed similar structure from search.js
        const savedTemplates = await prisma.template.findMany({
            where: {
                userId: Number(userId),
                OR: [
                    titleQuery ? { title: { contains: titleQuery } } : null,
                    explanationQuery ? { explanation: { contains: explanationQuery } } : null,
                    tagQuery 
                        ? {
                            tags: {
                                some: {
                                    name: { contains: tagQuery }
                                }
                            }
                        } : null
                ].filter(Boolean),
            }, 
            select: {
                id: true,
                title: true,
                explanation: true,
                code: true,
                tags: true,
            },
        });

        return res.status(200).json({savedTemplates});

    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}