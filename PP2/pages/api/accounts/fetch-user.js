//fetch-user is a function that fetches the user's profile from the database
//while edit.js is the endpoint thats still is responsible for updating user data
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed.' });
    }

    // decode and verify the token from the request headers
    const verifiedUser = verifyToken(req.headers.authorization);

    if (!verifiedUser) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    try {
        // fetch the user's profile from the database
        const user = await prisma.user.findUnique({
            where: { id: verifiedUser.userId },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // return the user's profile
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Error fetching profile data.' });
    }
}
