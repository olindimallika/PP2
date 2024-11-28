import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify admin with verifyToken
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token.' });
    }

    // Check that the user is an admin
    if (verifiedUser.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
    }

    if (req.method === 'PUT') {
        const { blogPostId, commentId } = req.body as {
            blogPostId?: number;
            commentId?: number;
        };

        // Validate that either blogPostId or commentId is provided
        if (!blogPostId && !commentId) {
            return res.status(400).json({ error: 'Please provide the ID of either a blog post or comment to hide.' });
        }

        try {
            // Hide the inappropriate blog post
            if (blogPostId) {
                const blogPost = await prisma.blogPost.update({
                    where: {
                        id: Number(blogPostId),
                    },
                    data: {
                        isHidden: true,
                    },
                });

                if (!blogPost) {
                    return res.status(404).json({ error: 'Blog post not found.' });
                }
            }

            // Hide the inappropriate comment
            if (commentId) {
                const comment = await prisma.comment.update({
                    where: {
                        id: Number(commentId),
                    },
                    data: {
                        isHidden: true,
                    },
                });

                if (!comment) {
                    return res.status(404).json({ error: 'Comment not found.' });
                }
            }

            return res.status(200).json({ message: 'Content hidden successfully!' });
        } catch (error) {
            console.error('Error hiding content:', error); // Log the error for debugging
            return res.status(500).json({ error: 'Error hiding content.' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed.' });
    }
}
