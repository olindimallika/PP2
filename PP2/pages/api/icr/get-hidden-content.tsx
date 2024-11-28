import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify token
  const token = req.headers.authorization || '';
  const verifiedUser = verifyToken(token);

  if (!verifiedUser) {
    return res.status(401).json({ error: 'Unauthorized or invalid token. Please log in!' });
  }

  // Check that the user is an admin
  if (verifiedUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
  }

  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Fetch hidden blog posts
    const hiddenPosts = await prisma.blogPost.findMany({
      where: {
        isHidden: true, // Fetch only hidden posts
      },
      select: {
        id: true, // Blog post ID
        title: true, // Blog post title
        description: true, // Blog post description
        user: {
          select: {
            firstName: true, // Author's first name
            lastName: true, // Author's last name
          },
        },
        tags: {
          select: {
            name: true, // Associated tags
          },
        },
      },
    });

    // Fetch hidden comments
    const hiddenComments = await prisma.comment.findMany({
      where: {
        isHidden: true, // Fetch only hidden comments
      },
      select: {
        id: true, // Comment ID
        content: true, // Comment content
        blogPostId: true, // Associated blog post ID
        user: {
          select: {
            firstName: true, // Author's first name
            lastName: true, // Author's last name
          },
        },
      },
    });

    // Return hidden posts and comments
    return res.status(200).json({
      posts: hiddenPosts,
      comments: hiddenComments,
    });
  } catch (error) {
    console.error('Error fetching hidden content:', error); // Log the error for debugging
    return res.status(500).json({ error: 'Error fetching hidden content.' });
  }
}
