//claude
// Backend: get-my-posts.js
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { page = 1, pageSize = 10 } = req.query;

    if (method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization || '';
    const verifiedUser = verifyToken(token);
    if (!verifiedUser) {
        return res.status(401).json({ error: 'Unauthorized or invalid token' });
    }

    const userId = verifiedUser.userId;
    const pageNum = parseInt(page.toString(), 10);
    const pageSizeNum = parseInt(pageSize.toString(), 10);
    const skip = (pageNum - 1) * pageSizeNum;

    try {
        const totalItems = await prisma.blogPost.count({
            where: {
                userId,
                isHidden: false,
            }
        });

        const posts = await prisma.blogPost.findMany({
            where: {
                userId,
                isHidden: false,
            },
            include: {
                tags: true,
                templates: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            skip,
            take: pageSizeNum,
        });

        const totalPages = Math.ceil(totalItems / pageSizeNum);

        return res.status(200).json({
            posts,
            currentPage: pageNum,
            totalPages,
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ error: 'Error fetching posts.' });
    }
}


// import { NextApiRequest, NextApiResponse } from 'next';
// import prisma from '../../../utils/db';
// import { verifyToken } from '../../../utils/auth';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { method } = req;

//     if (method !== 'GET') {
//         return res.status(405).json({ error: 'Method not allowed' }); // only allow GET requests
//     }

//     // verify the user's token to make sure they're logged in
//     const token = req.headers.authorization || '';
//     const verifiedUser = verifyToken(token);
//     if (!verifiedUser) {
//         return res.status(401).json({ error: 'Unauthorized or invalid token. Please log in!' });
//     }

//     const userId = verifiedUser.userId; // get user ID from our verified token

//     try {
//         // fetch all blog posts authored by the logged-in user
//         const blogPosts = await prisma.blogPost.findMany({
//             where: {
//                 userId, // for filtering by the user's ID
//                 isHidden: false, // only fetch blog posts that are not hidden
//             },
//             include: {
//                 tags: true, // Include tags associated with each blog post
//                 templates: {
//                     select: {
//                         id: true, // Include the ID of each template
//                         title: true, // Include the title of each template
//                     },
//                 },
//             },
//         });

//         return res.status(200).json({ posts: blogPosts }); // return the fetched blog posts
//     } catch (error) {
//         console.error('Error fetching blog posts:', error.message); // log the error for debugging
//         return res.status(500).json({ error: 'An error occurred while fetching blog posts.' });
//     }
// }
