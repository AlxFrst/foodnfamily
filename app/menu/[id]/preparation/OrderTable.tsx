'use client';

import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { updateOrderStatus, archiveOrder } from '../actions';
import ArchiveConfirmationModal from './ArchiveConfirmationModal';
import ConfirmationModal from './ConfirmationModal';
import { Edit, Trash, Check, X, PlusCircle, ClipboardList, Eye, Clock, Loader } from 'lucide-react';
import AnimatedCircularProgressBar from "@/components/magicui/animated-circular-progress-bar";

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
    socketUrl: string;
}

export default function OrderTable({ menuId, orders: initialOrders, socketUrl }: OrderTableProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders.filter(order => order.status !== 'ARCHIVED'));
    const [orderToArchive, setOrderToArchive] = useState<Order | null>(null);
    const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);
    const detailsRefs = useRef<{ [key: number]: HTMLDetailsElement | null }>({});
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const storedPassword = Cookies.get(`menu_${menuId}_pwd`);
        console.log(storedPassword);
        if (storedPassword) {
            setIsAuthenticated(true);
        }
    }, [menuId]);

    useEffect(() => {
        const wsUrl = socketUrl;
        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => console.log('Connected to WebSocket server');
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'NEW_ORDER') {
                setOrders(prevOrders => [...prevOrders, message.order]);
            } else if (message.type === 'UPDATE_ORDER_STATUS') {
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id === message.orderId ? { ...order, status: message.newStatus } : order
                ));
            }
        };
        ws.onclose = () => console.log('WebSocket connection closed');
        ws.onerror = (error) => console.error('WebSocket error:', error);

        return () => ws.close();
    }, []);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        if (!isAuthenticated) return;

        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: updatedOrder.status } : o));
            if (newStatus === 'COMPLETED' && detailsRefs.current[orderId]) {
                detailsRefs.current[orderId].open = false;
            }
            socket?.send(JSON.stringify({
                type: 'UPDATE_ORDER_STATUS',
                orderId: orderId,
                newStatus: newStatus,
            }));
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut de la commande', error);
        }
    };

    const handleArchive = async (orderId: number) => {
        if (!isAuthenticated) return;

        try {
            await archiveOrder(orderId);
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (error) {
            console.error('Erreur lors de l\'archivage de la commande', error);
        }
    };

    const handleConfirm = async () => {
        if (orderToConfirm) {
            await handleStatusChange(orderToConfirm.id, 'PENDING');
            setOrderToConfirm(null);
        }
    };

    const handleCancel = () => {
        setOrderToConfirm(null);
    };

    const filteredOrders = orders.filter(order =>
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const groupedOrders = {
        PENDING: filteredOrders.filter(order => order.status === 'PENDING'),
        IN_PROGRESS: filteredOrders.filter(order => order.status === 'IN_PROGRESS'),
        COMPLETED: filteredOrders.filter(order => order.status === 'COMPLETED')
    };

    const orderStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'PENDING').length,
        inProgressOrders: orders.filter(order => order.status === 'IN_PROGRESS').length,
        completedOrders: orders.filter(order => order.status === 'COMPLETED').length,
        ingredients: orders.filter(order => order.status !== 'COMPLETED').reduce((acc, order) => {
            order.items.forEach(item => {
                acc[item.item.name] = (acc[item.item.name] || 0) + item.quantity;
            });
            return acc;
        }, {} as { [key: string]: number })
    };

    let completionPercentage = orderStats.totalOrders === 0 ? 0 : (orderStats.completedOrders / orderStats.totalOrders) * 100;
    completionPercentage = Math.round(completionPercentage * 100) / 100;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Préparation des commandes</h1>
                <a href={`/menu/${menuId}`} className="px-4 py-2 bg-blue-500 text-white rounded">Retour au menu</a>
            </div>
            <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Tableau de bord</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center bg-gray-200 p-2 rounded-lg">
                        <ClipboardList size={24} className="mr-2" />
                        <span>Total des commandes : {orderStats.totalOrders}</span>
                    </div>
                    <div className="flex items-center bg-yellow-200 p-2 rounded-lg">
                        <Clock size={24} className="mr-2" />
                        <span>Commandes en attente : {orderStats.pendingOrders}</span>
                    </div>
                    <div className="flex items-center bg-blue-200 p-2 rounded-lg">
                        <Loader size={24} className="mr-2" />
                        <span>Commandes en cours : {orderStats.inProgressOrders}</span>
                    </div>
                    <div className="flex items-center bg-green-200 p-2 rounded-lg">
                        <Check size={24} className="mr-2" />
                        <span>Commandes terminées : {orderStats.completedOrders}</span>
                    </div>
                    <div className="flex items-center justify-center col-span-2">
                        <AnimatedCircularProgressBar
                            max={100}
                            min={0}
                            value={completionPercentage}
                            gaugePrimaryColor="rgb(79 70 229)"
                            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                        />
                    </div>
                </div>
                <h3 className="text-lg font-medium mt-2">Ingrédients commandés :</h3>
                <ul className="list-disc pl-5">
                    {Object.entries(orderStats.ingredients).map(([name, quantity]) => (
                        <li key={name}>{name}: {quantity}</li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded w-full mr-2"
                />
            </div>
            <div className="overflow-x-auto">
                {Object.entries(groupedOrders).map(([status, orders]) => (
                    <div key={status} className="mb-6">
                        <h2 className={`text-lg font-semibold mb-2 ${status === 'PENDING' ? 'text-yellow-500' :
                            status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-green-500'}`}>
                            {status === 'PENDING' ? 'Commandes en attente' :
                                status === 'IN_PROGRESS' ? 'Commandes en cours' : 'Commandes terminées'}
                        </h2>
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">{order.userName}</h3>
                                            {isAuthenticated ? (
                                                <button
                                                    onClick={() => {
                                                        if (order.status === 'COMPLETED') {
                                                            setOrderToConfirm(order);
                                                        } else {
                                                            handleStatusChange(order.id, order.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED');
                                                        }
                                                    }}
                                                    className={`mt-1 px-2 py-1 rounded ${order.status === 'PENDING' ? 'bg-yellow-500' :
                                                        order.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
                                                        } text-white text-sm`}
                                                >
                                                    {order.status === 'PENDING' ? 'En attente' :
                                                        order.status === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}
                                                </button>
                                            ) : (
                                                <span className={`mt-1 px-2 py-1 rounded ${order.status === 'PENDING' ? 'bg-yellow-500' :
                                                    order.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-green-500'
                                                    } text-white text-sm`}>
                                                    {order.status === 'PENDING' ? 'En attente' :
                                                        order.status === 'IN_PROGRESS' ? 'En cours' : 'Terminé'}
                                                </span>
                                            )}
                                        </div>
                                        {isAuthenticated && (
                                            <button
                                                onClick={() => setOrderToArchive(order)}
                                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <details
                                        ref={(el) => {
                                            if (el) detailsRefs.current[order.id] = el;
                                        }}
                                        className="mt-2 cursor-pointer"
                                    >
                                        <summary className="text-blue-500">Voir les détails</summary>
                                        <ul className="pl-4 mt-2 list-disc list-inside text-gray-700">
                                            {order.items?.map(item => (
                                                <li key={item.id}>{item.item.name} - Quantité: {item.quantity}</li>
                                            )) || <li>Aucun élément de commande</li>}
                                        </ul>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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
            {orderToConfirm && (
                <ConfirmationModal
                    message="Voulez-vous vraiment repasser cette commande en attente ?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
