import prisma from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed. Use GET.' });
  }

  try {
    //extract page and pageSize from query parameters, with defaults
    const { page = 1, pageSize = 10 } = req.query;

    //ensure page and pageSize are numbers
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 5) || 5;

    //calculate skip and take values for pagination
    const skip = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;

    //fetch total count of blog posts for pagination metadata
    const totalItems = await prisma.blogPost.count();

    //fetch blog posts with pagination
    const blogPosts = await prisma.blogPost.findMany({
      skip,
      take,
      select: {
        id: true,
        title: true,
        description: true,
        upvoteCount: true,
        downvoteCount: true,
        comments: {
          select: {
            id: true,
            content: true,
            upvoteCount: true,
            downvoteCount: true,
          },
        },
      },
    });

    //calculate rating scores and sort comments
    const sortedBlogPosts = blogPosts.map((post) => {
      const ratingScore = post.upvoteCount - post.downvoteCount;

      //sort comments for each post by rating score (upvotes - downvotes)
      const sortedComments = post.comments
        .map((comment) => ({
          ...comment,
          ratingScore: comment.upvoteCount - comment.downvoteCount,
        }))
        .sort((a, b) => b.ratingScore - a.ratingScore); // Sort by rating score descending

      //return the blog post with calculated rating score and sorted comments
      return {
        ...post,
        ratingScore,
        comments: sortedComments,
      };
    });

    //sort blog posts by rating score in descending order
    sortedBlogPosts.sort((a, b) => b.ratingScore - a.ratingScore);

    //calculate total pages
    const totalPages = Math.ceil(totalItems / pageSizeNum);

    //return paginated and sorted blog posts with their sorted comments
    return res.status(200).json({
      message: 'Blog posts and comments sorted by rating retrieved successfully!',
      currentPage: pageNum,
      pageSize: pageSizeNum,
      totalItems,
      totalPages,
      blogPosts: sortedBlogPosts,
    });
  } catch (error) {
    console.error('Error retrieving sorted blog posts and comments:', error);
    return res.status(500).json({ error: 'Error retrieving sorted content' });
  }
}
