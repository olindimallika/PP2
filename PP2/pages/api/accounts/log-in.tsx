import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import { comparePassword, generateAccessToken, generateRefreshToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body as { email: string; password: string };

        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        try {
            // Find the user by email
            const user = await prisma.user.findUnique({
                where: { email },
            });

            // Verify the password
            if (!user || !(await comparePassword(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            // Generate tokens
            const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
            const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

            return res.status(200).json({ userId: user.id, role: user.role, accessToken, refreshToken });
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed.' });
    }
}
