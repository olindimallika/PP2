import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
    const { method } = req;

    if (method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' }); // only allow GET requests
    }

    // verify the user's token to make sure they're are logged in
    const verifiedUser = verifyToken(req.headers.authorization);
    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token. Please log in!' });
    }

    const userId = verifiedUser.userId; // get user ID from our verified token

    try {
        // fetch all blog posts authored by the logged-in user
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                userId, // for filtering by the user's ID
                isHidden: false, // only fetch blog posts that are not hidden
            },
            include: {
                tags: true, // Include tags associated with each blog post
                templates: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return res.status(200).json({ posts: blogPosts }); // return the fetched blog posts
    } catch (error) {
        console.error('Error fetching blog posts:', error.message); // log the error for debugging
        return res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
    }
}
