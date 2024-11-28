import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
  // Verify token
  const verifiedUser = verifyToken(req.headers.authorization);
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
        isHidden: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch hidden comments
    const hiddenComments = await prisma.comment.findMany({
      where: {
        isHidden: true,
      },
      select: {
        id: true,
        content: true,
        blogPostId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.status(200).json({
      posts: hiddenPosts,
      comments: hiddenComments,
    });
  } catch (error) {
    console.error('Error fetching hidden content:', error);
    return res.status(500).json({ error: 'Error fetching hidden content.' });
  }
}
