import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/db';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { firstName, lastName, email, password, avatar, phoneNumber, role } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        avatar?: string;
        phoneNumber?: string;
        role?: string;
    };

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Please fill all fields' });
    }

    // Validate avatar selection
    const validAvatars = ['/avatars/avatar1.png', '/avatars/avatar2.png', '/avatars/avatar3.png'];
    if (avatar && !validAvatars.includes(avatar)) {
        return res.status(400).json({ error: 'Invalid avatar selection' });
    }

    try {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'This email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                avatar: avatar || null,
                phoneNumber: phoneNumber || null,
                role: role || 'user', // Default role to 'user' if not provided
            },
            // Return specific fields
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                phoneNumber: true,
                role: true,
            },
        });

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
