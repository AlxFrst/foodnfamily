import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import PasswordProtectedMenu from './PasswordProtectedMenu';

const prisma = new PrismaClient();

interface MenuPageProps {
    params: { id: string };
}

export default async function MenuPage({ params }: MenuPageProps) {
    const menu = await prisma.menu.findUnique({
        where: { id: parseInt(params.id, 10) },
        include: {
            categories: {
                include: {
                    items: true,
                },
            },
        },
    });

    if (!menu) {
        notFound();
    }

    return <PasswordProtectedMenu menuId={menu.id} adminPwd={menu.adminPwd} categories={menu.categories} menuName={menu.name} />;
}
