'use client';

import { useState, useEffect } from 'react';
import { createOrder } from '../actions';
import OrderSummaryModal from './OrderSummaryModal';
import QRCodeModal from './QRCodeModal';
import ShineBorder from "@/components/magicui/shine-border";
import { ClipboardList } from 'lucide-react';
import confetti from "canvas-confetti";

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
    const [isOrderValid, setIsOrderValid] = useState(false);

    useEffect(() => {
        const wsUrl = 'https://ws-foodnfamily.alxfrst.fr';

        const ws = new WebSocket(wsUrl);
        setSocket(ws);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'UPDATE_CATEGORIES') {
                setCategories(message.categories);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        setIsOrderValid(userName.trim().length > 0 && totalQuantity > 0);
    }, [userName, orderItems]);

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

    const handleConfetti = () => {
        const scalar = 2;
        const unicorn = confetti.shapeFromText({ text: "🦄", scalar });

        const defaults = {
            spread: 360,
            ticks: 60,
            gravity: 0,
            decay: 0.96,
            startVelocity: 20,
            shapes: [unicorn],
            scalar,
        };

        const shoot = () => {
            confetti({
                ...defaults,
                particleCount: 30,
            });

            confetti({
                ...defaults,
                particleCount: 5,
            });

            confetti({
                ...defaults,
                particleCount: 15,
                scalar: scalar / 2,
                shapes: ["circle"],
            });
        };

        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newOrder = await createOrder(menuId, userName, orderItems);
            const itemsSummary = orderItems.map(orderItem => {
                const item = categories.flatMap(category => category.items).find(i => i.id === orderItem.itemId);
                return { name: item?.name || '', quantity: orderItem.quantity };
            });
            setOrderSummary({ userName, items: itemsSummary });

            // Notify the server to broadcast the new order
            if (socket) {
                socket.send(JSON.stringify({
                    type: 'NEW_ORDER',
                    order: newOrder,
                }));
            }

            handleConfetti(); // Trigger confetti on successful order creation
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
                <ClipboardList size={24} />
            </button>

            <h1 className="text-3xl font-bold mb-6 text-center">{menuName}</h1>

            {categories.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-xl">Le menu ne contient pas encore de catégories ou de plats.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {categories.map(category => (
                        <ShineBorder
                            key={category.id}
                            className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl w-full p-4"
                            color={["#667db6", "#0082c8", "#667db6"]}
                        >
                            <div className="bg-white p-4 shadow-lg rounded-xl w-full">
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
                                            <p className="text-gray-500 text-sm mt-2">Stock: {item.stock}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ShineBorder>
                    ))}
                    <div className="bg-white p-6 shadow-lg rounded-2xl w-full">
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
                            className={`mt-4 w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isOrderValid ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!isOrderValid}
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
