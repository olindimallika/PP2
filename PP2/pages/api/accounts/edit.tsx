import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { verifyToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id } = req.query;
        const { firstName, lastName, email, avatar, phoneNumber } = req.body;

        // Decode and verify the token before allowing the user to edit profile information
        const verifiedUser = verifyToken(req.headers.authorization || '');

        if (!verifiedUser) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }

        // Check for a valid user ID
        if (!id || Array.isArray(id) || isNaN(Number(id))) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        // Check if the user filled any fields to update
        if (!firstName && !lastName && !email && !avatar && !phoneNumber) {
            return res.status(400).json({ message: 'Please fill at least one field to update.' });
        }

        try {
            const user = await prisma.user.update({
                where: {
                    id: Number(id),
                },
                data: {
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(email && { email }),
                    ...(avatar && { avatar }),
                    ...(phoneNumber && { phoneNumber }),
                },
                // Return updated profile information
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                    phoneNumber: true,
                },
            });

            // If the provided user ID doesn't exist
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ message: 'User updated successfully.', user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed.' });
    }
}
