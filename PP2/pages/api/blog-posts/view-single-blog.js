import prisma from '../../../utils/db';


export default async function handler(req, res) {
   if (req.method !== 'GET') {
       return res.status(405).json({ error: 'Method not allowed.' });
   }


   const { id } = req.query;


   if (!id || isNaN(id)) {
       return res.status(400).json({ error: 'Invalid blog post ID.' });
   }


   try {
       const blogPost = await prisma.blogPost.findUnique({
           where: { id: Number(id) },
           include: {
               user: true,
               templates: true,
               comments: {
                   include: {
                       user: { select: { firstName: true, lastName: true, avatar: true } }, // Include avatar
                       replies: {
                           include: {
                               user: { select: { firstName: true, lastName: true, avatar: true } }, // Include avatar in replies
                           },
                       },
                   },
               },
           },
       });


       if (!blogPost) {
           return res.status(404).json({ error: 'Blog post not found.' });
       }


       res.status(200).json({ post: blogPost });
   } catch (error) {
       console.error('Error fetching blog post:', error);
       res.status(500).json({ error: 'Error fetching blog post.' });
   }
}
