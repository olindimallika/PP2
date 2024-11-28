import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // Verify token and user authentication
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    // Verify the method is PUT
    if (method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed. Use PUT.' });
    }

    // Check if the token is valid
    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token.' });
    }

    // Ensure the user is an admin
    if (verifiedUser.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
    }

    const { blogPostId, commentId } = req.body as {
        blogPostId?: number;
        commentId?: number;
    };

    // Ensure only one of blogPostId or commentId is provided
    if ((blogPostId && commentId) || (!blogPostId && !commentId)) {
        return res.status(400).json({
            error: 'Provide either a blog post ID or a comment ID, not both.',
        });
    }

    try {
        if (blogPostId) {
            // Unhide a blog post
            const blogPost = await prisma.blogPost.update({
                where: {
                    id: Number(blogPostId),
                },
                data: {
                    isHidden: false, // Set hidden to false
                },
            });

            if (!blogPost) {
                return res.status(404).json({ error: 'Blog post not found.' });
            }

            return res.status(200).json({
                message: 'Blog post unhidden successfully!',
                blogPost,
            });
        }

        if (commentId) {
            // Unhide a comment
            const comment = await prisma.comment.update({
                where: {
                    id: Number(commentId),
                },
                data: {
                    isHidden: false, // Set hidden to false
                },
            });

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found.' });
            }

            return res.status(200).json({
                message: 'Comment unhidden successfully!',
                comment,
            });
        }
    } catch (error) {
        console.error('Error unhiding content:', error); // Log the error for debugging
        return res.status(500).json({ error: 'Error unhiding content.' });
    }
}
