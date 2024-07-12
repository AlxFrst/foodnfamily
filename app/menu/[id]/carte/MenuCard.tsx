'use client';

import { useState, useEffect } from 'react';
import { createOrder } from '../actions';
import OrderSummaryModal from './OrderSummaryModal';
import QRCode from 'qrcode.react';
import QRCodeModal from './QRCodeModal';

interface Category {
    id: number;
    name: string;
    items: MenuItem[];
}

interface MenuItem {
    id: number;
    name: string;
    stock: number;
}

interface MenuCardProps {
    menuId: number;
    menuName: string;
    categories: Category[];
}

export default function MenuCard({ menuId, menuName, categories: initialCategories }: MenuCardProps) {
    const [userName, setUserName] = useState('');
    const [orderItems, setOrderItems] = useState<{ itemId: number; quantity: number }[]>([]);
    const [orderSummary, setOrderSummary] = useState<{ userName: string; items: { name: string; quantity: number }[] } | null>(null);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        setSocket(ws);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'UPDATE_CATEGORIES') {
                setCategories(message.categories);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const handleQuantityChange = (itemId: number, quantity: number) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.itemId === itemId);
            if (existingItem) {
                return prevItems.map(item =>
                    item.itemId === itemId ? { ...item, quantity } : item
                );
            } else {
                return [...prevItems, { itemId, quantity }];
            }
        });
    };

    const handleIncrement = (itemId: number) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.itemId === itemId);
            if (existingItem) {
                return prevItems.map(item =>
                    item.itemId === itemId ? { ...item, quantity: existingItem.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { itemId, quantity: 1 }];
            }
        });
    };

    const handleDecrement = (itemId: number) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.itemId === itemId);
            if (existingItem && existingItem.quantity > 0) {
                return prevItems.map(item =>
                    item.itemId === itemId ? { ...item, quantity: existingItem.quantity - 1 } : item
                );
            } else {
                return prevItems;
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createOrder(menuId, userName, orderItems);
            const itemsSummary = orderItems.map(orderItem => {
                const item = categories.flatMap(category => category.items).find(i => i.id === orderItem.itemId);
                return { name: item?.name || '', quantity: orderItem.quantity };
            });
            setOrderSummary({ userName, items: itemsSummary });

            // Notify the server to broadcast the updated categories
            if (socket) {
                socket.send(JSON.stringify({ type: 'UPDATE_CATEGORIES', categories }));
            }
        } catch (error) {
            console.error('Erreur lors de la création de la commande', error);
            alert('Erreur lors de la création de la commande');
        }
    };

    const handleNewOrder = () => {
        setUserName('');
        setOrderItems([]);
        setOrderSummary(null);
    };

    const handleQRCodeClick = () => {
        setIsQRCodeModalOpen(true);
    };

    const handleQRCodeModalClose = () => {
        setIsQRCodeModalOpen(false);
    };

    return (
        <div className="relative p-4 bg-gray-50 min-h-screen">
            <button
                onClick={handleQRCodeClick}
                className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h3v3H3V3zm0 8h3v3H3v-3zm0 8h3v3H3v-3zm8-16h3v3h-3V3zm0 8h3v3h-3v-3zm0 8h3v3h-3v-3zm8-16h3v3h-3V3zm0 8h3v3h-3v-3zm0 8h3v3h-3v-3z" />
                </svg>
            </button>

            <h1 className="text-3xl font-bold mb-6 text-center">{menuName}</h1>

            {categories.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-xl">Le menu ne contient pas encore de catégories ou de plats.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {categories.map(category => (
                        <div key={category.id} className="bg-white p-4 shadow-lg rounded-xl">
                            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {category.items.map(item => (
                                    <div key={item.id} className="bg-white shadow-md rounded-lg p-4 relative">
                                        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                                        <div className="flex items-center mt-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDecrement(item.id)}
                                                className="px-3 py-1 bg-gray-300 rounded-lg"
                                            >
                                                -
                                            </button>
                                            <input
                                                id={`quantity-${item.id}`}
                                                type="number"
                                                min="0"
                                                max={item.stock}
                                                value={orderItems.find(orderItem => orderItem.itemId === item.id)?.quantity || 0}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleIncrement(item.id)}
                                                className="px-3 py-1 bg-gray-300 rounded-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="bg-white p-6 shadow-lg rounded-2xl">
                        <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor="user-name">
                            Nom
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            className="mt-4 w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Passer la commande
                        </button>
                    </div>
                </form>
            )}

            {orderSummary && (
                <OrderSummaryModal
                    userName={orderSummary.userName}
                    items={orderSummary.items}
                    onClose={handleNewOrder}
                />
            )}

            {isQRCodeModalOpen && (
                <QRCodeModal url={window.location.href} onClose={handleQRCodeModalClose} />
            )}
        </div>
    );
}