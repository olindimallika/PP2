import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { id } = req.query;

    // Validate that the `id` is provided and is a valid number
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'Invalid blog post ID.' });
    }

    try {
        // Fetch the blog post, including user, templates, and comments
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: Number(id) },
            include: {
                user: true, // Include details about the user who created the post
                templates: true, // Include templates associated with the post
                comments: {
                    include: {
                        user: { select: { firstName: true, lastName: true, avatar: true } }, // Include avatar
                        replies: {
                            include: {
                                user: { select: { firstName: true, lastName: true, avatar: true } }, // Include avatar in replies
                            },
                        },
                    },
                },
            },
        });

        // Handle case where blog post is not found
        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found.' });
        }

        // Return the fetched blog post
        res.status(200).json({ post: blogPost });
    } catch (error) {
        console.error('Error fetching blog post:', error); // Log the error for debugging purposes
        res.status(500).json({ error: 'Error fetching blog post.' });
    }
}

