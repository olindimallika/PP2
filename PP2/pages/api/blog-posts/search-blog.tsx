import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../utils/db";
import { executeCode } from '../../../utils/codeRunner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        titleQuery,
        contentQuery,
        templateQuery,
        tagsQuery, // Include tagsQuery
        action,
        templateId,
        input,
        userId,
        page = 1,
        pageSize = 10
    } = req.body as {
        titleQuery?: string;
        contentQuery?: string;
        templateQuery?: string;
        tagsQuery?: string; // Define tagsQuery type
        action?: string;
        templateId?: number;
        input?: any;
        userId?: number;
        page?: number;
        pageSize?: number;
    };

    if (!action) {
        if (!titleQuery && !contentQuery && !templateQuery && !tagsQuery) { // Check for tagsQuery
            return res.status(400).json({ error: 'At least one search field must be filled.' });
        }

        try {
            // Calculate offset and limit for pagination
            const skip = (page - 1) * pageSize;
            const take = pageSize;

            // Build the search query dynamically based on provided fields
            const searchConditions = {
                isHidden: false,
                OR: [
                    titleQuery ? { title: { contains: titleQuery } } : null,
                    contentQuery ? { description: { contains: contentQuery } } : null,
                    templateQuery
                        ? {
                            templates: {
                                some: {
                                    title: { contains: templateQuery }
                                }
                            }
                        }
                        : null,
                    tagsQuery
                        ? {
                            tags: {
                                some: {
                                    name: { contains: tagsQuery } // Removed `mode: "insensitive"`
                                }
                            }
                        }
                        : null
                ].filter(Boolean), // Remove null entries
            };

            // Fetch total count for the query
            const totalItems = await prisma.blogPost.count({
                where: searchConditions,
            });

            // Fetch paginated blog posts
            const blogPosts = await prisma.blogPost.findMany({
                where: searchConditions,
                take,
                skip,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    user: {
                        select: { firstName: true, lastName: true }
                    },
                    tags: { select: { name: true } }, // Include tags
                    templates: {
                        select: {
                            id: true,
                            title: true,
                            code: true,
                        }
                    }
                }
            });

            const totalPages = Math.ceil(totalItems / pageSize);

            const response = blogPosts.map(post => ({
                ...post,
                templates: post.templates.map(template => ({
                    ...template,
                    link: `/api/templateActions?id=${template.id}&action=view`
                }))
            }));

            return res.status(200).json({
                currentPage: page,
                pageSize,
                totalItems,
                totalPages,
                blogPosts: response
            });
        } catch (error) {
            console.error('Error retrieving blog posts:', error.message);
            return res.status(500).json({ error: 'Error retrieving blog posts' });
        }
    } else {
        if (!templateId) {
            return res.status(400).json({ error: 'Template ID is required for this action.' });
        }

        try {
            const template = await prisma.template.findUnique({
                where: { id: Number(templateId) },
                select: {
                    id: true,
                    title: true,
                    explanation: true,
                    code: true,
                    userId: true,
                }
            });

            if (!template) {
                return res.status(404).json({ error: 'Template not found.' });
            }

            if (action === 'view') {
                return res.status(200).json({ template });
            } else if (action === 'run') {
                const result = await executeCode(template.code, input);
                return res.status(200).json({ result });
            } else if (action === 'fork') {
                const forkedTemplate = await prisma.template.create({
                    data: {
                        title: `${template.title} (Forked)`,
                        explanation: template.explanation,
                        code: template.code,
                        isFork: true,
                        forkedFromId: template.id,
                        userId: userId || null
                    }
                });

                return res.status(201).json({
                    message: 'Template forked successfully',
                    template: forkedTemplate,
                    link: `/api/templateActions?id=${forkedTemplate.id}&action=view`
                });
            } else {
                return res.status(400).json({ error: 'Invalid action. Use "view", "run", or "fork" as the action.' });
            }
        } catch (error) {
            console.error(`Error processing action ${action} on template:`, error.message);
            return res.status(500).json({ error: `Error processing ${action} on template` });
        }
    }
}


//old backend with no tagsQuery
// import { NextApiRequest, NextApiResponse } from 'next';
// import prisma from "../../../utils/db";
// import { executeCode } from '../../../utils/codeRunner';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ error: 'Method not allowed' });
//     }

//     const {
//         titleQuery,        // Query for title
//         contentQuery,      // Query for description/content
//         templateQuery,     // Query for templates
//         action,
//         templateId,
//         input,
//         userId,
//         page = 1,
//         pageSize = 10
//     } = req.body as {
//         titleQuery?: string;
//         contentQuery?: string;
//         templateQuery?: string;
//         action?: string;
//         templateId?: number;
//         input?: any;
//         userId?: number;
//         page?: number;
//         pageSize?: number;
//     };

//     if (!action) {
//         if (!titleQuery && !contentQuery && !templateQuery) {
//             return res.status(400).json({ error: 'At least one search field must be filled.' });
//         }

//         try {
//             // Calculate offset and limit for pagination
//             const skip = (page - 1) * pageSize;
//             const take = pageSize;

//             // Build the search query dynamically based on provided fields
//             const searchConditions = {
//                 isHidden: false,
//                 OR: [
//                     titleQuery ? { title: { contains: titleQuery } } : null,
//                     contentQuery ? { description: { contains: contentQuery } } : null,
//                     templateQuery
//                         ? {
//                             templates: {
//                                 some: {
//                                     title: { contains: templateQuery }
//                                 }
//                             }
//                         }
//                         : null
//                 ].filter(Boolean), // Remove null entries
//             };

//             // Fetch total count for the query
//             const totalItems = await prisma.blogPost.count({
//                 where: searchConditions,
//             });

//             // Fetch paginated blog posts
//             const blogPosts = await prisma.blogPost.findMany({
//                 where: searchConditions,
//                 take,
//                 skip,
//                 select: {
//                     id: true,
//                     title: true,
//                     description: true,
//                     user: {
//                         select: { firstName: true, lastName: true }
//                     },
//                     tags: { select: { name: true } },
//                     templates: {
//                         select: {
//                             id: true,
//                             title: true,
//                             code: true,
//                         }
//                     }
//                 }
//             });

//             const totalPages = Math.ceil(totalItems / pageSize);

//             const response = blogPosts.map(post => ({
//                 ...post,
//                 templates: post.templates.map(template => ({
//                     ...template,
//                     link: `/api/templateActions?id=${template.id}&action=view`
//                 }))
//             }));

//             return res.status(200).json({
//                 currentPage: page,
//                 pageSize,
//                 totalItems,
//                 totalPages,
//                 blogPosts: response
//             });
//         } catch (error) {
//             console.error('Error retrieving blog posts:', error.message);
//             return res.status(500).json({ error: 'Error retrieving blog posts' });
//         }
//     } else {
//         if (!templateId) {
//             return res.status(400).json({ error: 'Template ID is required for this action.' });
//         }

//         try {
//             const template = await prisma.template.findUnique({
//                 where: { id: Number(templateId) },
//                 select: {
//                     id: true,
//                     title: true,
//                     explanation: true,
//                     code: true,
//                     userId: true,
//                 }
//             });

//             if (!template) {
//                 return res.status(404).json({ error: 'Template not found.' });
//             }

//             if (action === 'view') {
//                 return res.status(200).json({ template });
//             } else if (action === 'run') {
//                 const result = await executeCode(template.code, input);
//                 return res.status(200).json({ result });
//             } else if (action === 'fork') {
//                 const forkedTemplate = await prisma.template.create({
//                     data: {
//                         title: `${template.title} (Forked)`,
//                         explanation: template.explanation,
//                         code: template.code,
//                         isFork: true,
//                         forkedFromId: template.id,
//                         userId: userId || null
//                     }
//                 });

//                 return res.status(201).json({
//                     message: 'Template forked successfully',
//                     template: forkedTemplate,
//                     link: `/api/templateActions?id=${forkedTemplate.id}&action=view`
//                 });
//             } else {
//                 return res.status(400).json({ error: 'Invalid action. Use "view", "run", or "fork" as the action.' });
//             }
//         } catch (error) {
//             console.error(`Error processing action ${action} on template:`, error.message);
//             return res.status(500).json({ error: `Error processing ${action} on template` });
//         }
//     }
// }




