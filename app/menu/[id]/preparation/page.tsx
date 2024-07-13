import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import OrderTable from './OrderTable';

const prisma = new PrismaClient();

interface PreparationPageProps {
    params: { id: string };
}

export default async function PreparationPage({ params }: PreparationPageProps) {
    const menu = await prisma.menu.findUnique({
        where: { id: parseInt(params.id, 10) },
        include: {
            orders: {
                include: {
                    items: {
                        include: {
                            item: true,
                        },
                    },
                },
                where: {
                    status: {
                        not: 'ARCHIVED',
                    },
                },
            },
        },
    });

    if (!menu) {
        notFound();
    }

    const orders = menu.orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
            ...item,
            item: item.item,
        })),
    }));

    return <OrderTable menuId={menu.id} orders={orders}, socketUrl={process.env.WEBSOCKET_URL || 'http//localhost:8080'} />;
}
