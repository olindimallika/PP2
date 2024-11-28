import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed. Use GET.' });
  }

  try {
    // Extract page and pageSize from query parameters with default values
    const { page = '1', pageSize = '10' } = req.query;

    // Convert page and pageSize to integers
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;

    // Calculate skip and take for pagination
    const skip = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;

    // Fetch all visible blog posts to calculate ratings (not paginated)
    const allBlogPosts = await prisma.blogPost.findMany({
      where: {
        isHidden: false, // Exclude hidden blog posts
      },
      select: {
        id: true,
        title: true,
        description: true,
        upvoteCount: true,
        downvoteCount: true,
        comments: {
          where: {
            isHidden: false, // Exclude hidden comments
          },
          select: {
            id: true,
            content: true,
            upvoteCount: true,
            downvoteCount: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        templates: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Calculate rating scores and sort comments for all blog posts
    const blogPostsWithRatings = allBlogPosts.map((post) => {
      const ratingScore = post.upvoteCount - post.downvoteCount;

      const sortedComments = post.comments
        .map((comment) => ({
          ...comment,
          ratingScore: comment.upvoteCount - comment.downvoteCount,
          user: {
            fullName: `${comment.user?.firstName || ''} ${comment.user?.lastName || ''}`.trim(),
            avatar: comment.user?.avatar || '/default-avatar.png',
          },
        }))
        .sort((a, b) => b.ratingScore - a.ratingScore); // Sort comments by rating score descending

      return {
        ...post,
        ratingScore,
        comments: sortedComments,
      };
    });

    // Sort blog posts by their rating scores in descending order
    const sortedBlogPosts = blogPostsWithRatings.sort((a, b) => b.ratingScore - a.ratingScore);

    // Paginate the sorted blog posts
    const paginatedBlogPosts = sortedBlogPosts.slice(skip, skip + take);

    // Calculate total pages
    const totalItems = sortedBlogPosts.length;
    const totalPages = Math.ceil(totalItems / pageSizeNum);

    // Return sorted and paginated blog posts
    return res.status(200).json({
      message: 'Blog posts and comments sorted by rating retrieved successfully!',
      currentPage: pageNum,
      pageSize: pageSizeNum,
      totalItems,
      totalPages,
      blogPosts: paginatedBlogPosts.map((post) => ({
        ...post,
        user: {
          fullName: `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim(),
          avatar: post.user?.avatar || '/default-avatar.png',
        },
        tags: post.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })),
        templates: post.templates.map((template) => ({
          id: template.id,
          title: template.title,
          link: `/api/templateActions?id=${template.id}&action=view`,
        })),
      })),
    });
  } catch (error) {
    console.error('Error retrieving sorted blog posts and comments:', error);
    return res.status(500).json({ error: 'Error retrieving sorted content' });
  }
}
