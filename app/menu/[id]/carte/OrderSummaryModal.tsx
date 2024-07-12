'use client';

interface OrderSummaryModalProps {
    userName: string;
    items: { name: string; quantity: number }[];
    onClose: () => void;
}

export default function OrderSummaryModal({ userName, items, onClose }: OrderSummaryModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Commande de {userName}</h2>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                            {item.name} - Quantité: {item.quantity}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Nouvelle commande
                </button>
            </div>
        </div>

    );
}
