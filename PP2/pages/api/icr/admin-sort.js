import prisma from '../../../utils/db';
import { verifyToken } from "../../../utils/auth";

export default async function handler(req, res) {
    const verifiedUser = verifyToken(req.headers.authorization);
  
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Unauthorized user or invalid token. Please log in!' });
    }
  
    if (verifiedUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You must be an admin!' });
    }
  
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed.' });
    }
  
    try {
      // Fetch blog posts with report count > 0
      const blogPosts = await prisma.blogPost.findMany({
        where: {
          reports: {
            some: {}, // Ensures there is at least one report
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          _count: {
            select: { reports: true },
          },
        },
        orderBy: {
          reports: {
            _count: 'desc', // Sort by report count in descending order
          },
        },
      });
  
      // Fetch comments with report count > 0
      const comments = await prisma.comment.findMany({
        where: {
          reports: {
            some: {}, // Ensures there is at least one report
          },
        },
        select: {
          id: true,
          content: true,
          _count: {
            select: { reports: true },
          },
        },
        orderBy: {
          reports: {
            _count: 'desc', // Sort by report count in descending order
          },
        },
      });
  
      return res.status(200).json({ blogPosts, comments });
    } catch (error) {
      console.error('Error retrieving sorted data:', error);
      return res.status(500).json({ error: 'Error retrieving sorted data.' });
    }
  }
  