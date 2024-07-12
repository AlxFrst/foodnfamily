'use client';

import { useState, useEffect, useRef } from 'react';
import { updateOrderStatus, archiveOrder } from '../actions';
import ArchiveConfirmationModal from './ArchiveConfirmationModal';

interface MenuItem {
    id: number;
    name: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    item: MenuItem;
}

interface Order {
    id: number;
    userName: string;
    status: string;
    items: OrderItem[];
}

interface OrderTableProps {
    menuId: number;
    orders: Order[];
}

export default function OrderTable({ menuId, orders: initialOrders }: OrderTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders.filter(order => order.status !== 'ARCHIVED'));
    const [orderToArchive, setOrderToArchive] = useState<Order | null>(null);
    const detailsRefs = useRef<{ [key: number]: HTMLDetailsElement | null }>({});

    const handleStatusChange = async (orderId: number) => {
        const order = orders.find(order => order.id === orderId);
        if (!order) return;

        const newStatus = order.status === 'PENDING' ? 'IN_PROGRESS' : order.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';

        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: updatedOrder.status } : o));

            if (newStatus === 'COMPLETED' && detailsRefs.current[orderId]) {
                detailsRefs.current[orderId].open = false;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de la commande', error);
        }
    };

    const handleArchive = async (orderId: number) => {
        try {
            await archiveOrder(orderId);
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (error) {
            console.error('Erreur lors de l\'archivage de la commande', error);
        }
    };

    const sortedOrders = orders.slice().sort((a, b) => {
        const statusOrder = { 'PENDING': 1, 'IN_PROGRESS': 2, 'COMPLETED': 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    });

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-center">Préparation des commandes</h1>
            <div className="overflow-x-auto">
                <div className="grid gap-4">
                    {sortedOrders.map(order => (
                        <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-semibold">{order.userName}</h2>
                                    <button
                                        onClick={() => handleStatusChange(order.id)}
                                        className={`mt-1 px-2 py-1 rounded ${order.status === 'PENDING' ? 'bg-yellow-500' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
                                            } text-white text-sm`}
                                    >
                                        {order.status === 'PENDING' ? 'En attente' :
                                            order.status === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setOrderToArchive(order)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                >
                                    Archiver
                                </button>
                            </div>
                            <details
                                ref={(el) => {
                                    if (el) detailsRefs.current[order.id] = el;
                                }}
                                className="mt-2 cursor-pointer"
                            >
                                <summary className="text-blue-500">Voir les détails</summary>
                                <ul className="pl-4 mt-2 list-disc list-inside text-gray-700">
                                    {order.items.map(item => (
                                        <li key={item.id}>{item.item.name} - Quantité: {item.quantity}</li>
                                    ))}
                                </ul>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
            {orderToArchive && (
                <ArchiveConfirmationModal
                    order={orderToArchive}
                    onConfirm={() => {
                        handleArchive(orderToArchive.id);
                        setOrderToArchive(null);
                    }}
                    onCancel={() => setOrderToArchive(null)}
                />
            )}
        </div>
    );
}
