import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from "../../../utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify the user token from the authorization header
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized user or invalid token. Please log in!' });
    }

    // Check if the user has admin privileges
    if (verifiedUser.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        // Fetch blog posts with at least one report
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                reports: {
                    some: {}, // Ensures there is at least one report
                },
            },
            select: {
                id: true, // Blog post ID
                title: true, // Blog post title
                description: true, // Blog post description
                _count: {
                    select: { reports: true }, // Count of reports associated with the blog post
                },
            },
            orderBy: {
                reports: {
                    _count: 'desc', // Sort by report count in descending order
                },
            },
        });

        // Fetch comments with at least one report
        const comments = await prisma.comment.findMany({
            where: {
                reports: {
                    some: {}, // Ensures there is at least one report
                },
            },
            select: {
                id: true, // Comment ID
                content: true, // Comment content
                _count: {
                    select: { reports: true }, // Count of reports associated with the comment
                },
            },
            orderBy: {
                reports: {
                    _count: 'desc', // Sort by report count in descending order
                },
            },
        });

        // Return the sorted blog posts and comments
        return res.status(200).json({ blogPosts, comments });
    } catch (error) {
        console.error('Error retrieving sorted data:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Error retrieving sorted data.' });
    }
}
