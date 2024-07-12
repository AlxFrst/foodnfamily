import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import MenuCard from './MenuCard';

const prisma = new PrismaClient();

interface MenuPageProps {
    params: { id: string };
}

export default async function CartePage({ params }: MenuPageProps) {
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

    return <MenuCard menuId={menu.id} menuName={menu.name} categories={menu.categories} />;
}
