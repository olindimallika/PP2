// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Seed Admin User
    const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'adminPassword123', // The admin password to be hashed
        avatar: '/avatars/avatar1.png',
        phoneNumber: '123-456-7890',
        role: 'admin'
    };

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    try {
        // Create or update the admin user
        const adminUser = await prisma.user.upsert({
            where: { email: adminData.email },
            update: {},
            create: {
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                email: adminData.email,
                password: hashedPassword,
                avatar: adminData.avatar,
                phoneNumber: adminData.phoneNumber,
                role: adminData.role
            },
            select: {
                id: true
            }
        });

        console.log("Admin user created successfully:", adminUser);

        // Seed Code Templates
        const templates = [
            {
                title: 'C++ Sorting Algorithm',
                explanation: 'Template for implementing sorting algorithms in C++.',
                code: `#include <iostream>
#include <vector>
void bubbleSort(std::vector<int>& arr) {
    for (size_t i = 0; i < arr.size(); i++) {
        for (size_t j = 0; j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j + 1]) std::swap(arr[j], arr[j + 1]);
        }
    }
}
int main() {
    std::vector<int> arr = {5, 1, 4, 2, 8};
    bubbleSort(arr);
    for (int num : arr) std::cout << num << ' ';
    return 0;
}`,
                tags: ['cpp', 'algorithm', 'sorting']
            },
            {
                title: 'Python Fibonacci Sequence',
                explanation: 'Template to calculate the Fibonacci sequence up to a certain number in Python.',
                code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=' ')
        a, b = b, a + b
fibonacci(10)`,
                tags: ['python', 'math', 'fibonacci']
            }
        ];

        for (const template of templates) {
            const createdTemplate = await prisma.template.create({
                data: {
                    title: template.title,
                    explanation: template.explanation,
                    code: template.code,
                    user: {
                        connect: { id: adminUser.id } // Link to the admin user
                    },
                    tags: {
                        create: template.tags.map(tag => ({ name: tag }))
                    }
                }
            });
            console.log("Template created successfully:", createdTemplate);
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
