'use client';

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

interface ArchiveConfirmationModalProps {
    order: Order;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ArchiveConfirmationModal({ order, onConfirm, onCancel }: ArchiveConfirmationModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Archiver la commande</h2>
                <p className="text-gray-700 mb-4">Êtes-vous sûr de vouloir archiver la commande de {order.userName} ?</p>
                <ul className="mt-2 mb-4 list-disc list-inside text-gray-700">
                    {order.items.map((item, index) => (
                        <li key={index}>{item.item.name} - Quantité: {item.quantity}</li>
                    ))}
                </ul>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>

    );
}
