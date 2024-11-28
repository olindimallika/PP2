import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // check if user is authenticated
    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);

    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token. Please log-in!' });
    }

    // get the id from the user that is logged in
    const userId = verifiedUser.userId;

    if (req.method === 'POST') {
        const { content, blogPostId, parentId, rating } = req.body as {
            content: string;
            blogPostId: number;
            parentId?: number;
            rating?: number;
        };

        if (!content) {
            return res.status(400).json({ error: 'Please fill in content and userId.' });
        }

        if (!blogPostId || isNaN(blogPostId)) {
            return res.status(400).json({ error: 'Invalid blogPostId.' });
        }

        try {
            // Validate the blog post
            const blogPost = await prisma.blogPost.findUnique({
                where: {
                    id: Number(blogPostId),
                },
            });

            if (blogPost) {
                if (blogPost.isHidden && blogPost.userId !== userId) {
                    return res.status(404).json({ error: 'Blog post not found.' });
                }
            } else {
                return res.status(404).json({ error: 'Blog post not found.' });
            }

            if (parentId) {
                if (isNaN(parentId)) {
                    return res.status(400).json({ error: 'Invalid parentId.' });
                }

                // Validate the parent comment
                const parent = await prisma.comment.findUnique({
                    where: {
                        id: Number(parentId),
                    },
                });

                if (parent) {
                    if (parent.isHidden && parent.userId !== userId) {
                        return res.status(404).json({ error: 'Blog post not found.' });
                    }
                } else {
                    return res.status(404).json({ error: 'Blog post not found.' });
                }
            }

            // Create the comment
            const comment = await prisma.comment.create({
                data: {
                    content,
                    userId,
                    blogPostId,
                    parentId, // optional parameter, only exists if creating a reply
                    rating,
                },
                include: {
                    blogPost: true, // Include the blog post details
                    parent: true, // Include the parent comment details
                    user: { select: { firstName: true, lastName: true, avatar: true } }, // Include avatar and user details
                },
            });

            return res.status(201).json({ message: 'Comment created successfully!', comment });
        } catch (error) {
            console.error('Error creating comment:', error);
            return res.status(500).json({ error: 'Error creating comment.' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed.' });
    }
}
