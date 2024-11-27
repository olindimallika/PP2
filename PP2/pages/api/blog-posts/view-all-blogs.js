import prisma from '../../../utils/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { page = 1, pageSize = 10 } = req.query;

        // Ensure page and pageSize are integers
        const pageNum = parseInt(page, 10) || 1;
        const pageSizeNum = parseInt(pageSize, 10) || 10;

        // Calculate skip and take for pagination
        const skip = (pageNum - 1) * pageSizeNum;
        const take = pageSizeNum;

        // Fetch total count for pagination metadata
        const totalItems = await prisma.blogPost.count();

        // Fetch all blog posts with pagination
        const blogPosts = await prisma.blogPost.findMany({
            skip,
            take,
            where: { isHidden: false }, // Exclude hidden posts
            select: {
                id: true,
                title: true,
                description: true,
                user: {
                    select: { firstName: true, lastName: true, avatar: true },
                },
                tags: { select: { name: true } },
                templates: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                    },
                },
            },
        });

        const totalPages = Math.ceil(totalItems / pageSizeNum);

        // Format the response with template links
        const formattedPosts = blogPosts.map((post) => ({
            ...post,
            templates: post.templates.map((template) => ({
                ...template,
                link: `/api/templateActions?id=${template.id}&action=view`,
            })),
        }));

        return res.status(200).json({
            currentPage: pageNum,
            pageSize: pageSizeNum,
            totalItems,
            totalPages,
            blogPosts: formattedPosts,
        });
    } catch (error) {
        console.error('Error retrieving blog posts:', error.message);
        return res.status(500).json({ error: 'Error retrieving blog posts' });
    }
}
