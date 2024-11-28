import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import jwt from 'jsonwebtoken';

// Verifies if the user is logged in
export const isLoggedIn = async (req: NextApiRequest): Promise<{ id: number; email: string; role: string } | null> => {
    // Extracting token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('No token found in the authorization header');
        return null;
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            console.error('User not found with decoded userId:', decoded.userId);
            return null;
        }

        return user;
    } catch (error: any) {
        console.error('Error decoding token:', error.message);
        return null;
    }
};

export default async function logOut(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const user = await isLoggedIn(req);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }

        // Logs users out by ending the session (no session management in this example)
        return res.status(200).json({ message: 'Successfully logged out.' });
    }

    return res.status(405).json({ message: 'Method not allowed.' });
}
