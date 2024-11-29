import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../utils/db";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Make sure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // From ChatGPT "verify admin with verifyToken"
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token.' });
    }

    const { title, explanation, code, tags, blogPostIds } = req.body as {
        title: string;
        explanation: string;
        code: string;
        tags?: string[];
        blogPostIds?: number[];
    };

    // Validate required fields, tags are optional
    if (!title || !explanation || !code) {
        return res.status(400).json({ error: 'Please provide a title, explanation, and code.' });
    }

    // Try-catch block generated by ChatGPT, prompt was "write a try catch block to handle code as a template with a title, explanation, and tags".
    try {
        // Finds all blog posts that are linked to the template but are not hidden
        const availableBlogPosts = await prisma.blogPost.findMany({
            where: {
                id: { in: blogPostIds || [] }, // Handle undefined blogPostIds
                isHidden: false,
            },
            // Create new array with only the IDs of the available blog posts
            select: { id: true },
        });

        // Save the template to the database
        const template = await prisma.template.create({
            data: {
                title,
                explanation,
                code,
                userId: verifiedUser.userId, // Link the template to the authenticated user
                tags: {
                    create: tags?.map((tag) => ({ name: tag })) || [], // Create tags if provided
                },
                blogPosts: {
                    connect: availableBlogPosts, // Link to existing blog posts by ID
                },
            },
            include: { tags: true, blogPosts: true }, // Include tags and linked blog posts in the response
        });

        return res.status(201).json({ message: 'Template saved successfully', template });
    } catch (error) {
        console.error("Error saving template:", error); // Log error for debugging
        return res.status(500).json({ error: 'Error saving template' });
    }
}