'use client';

import QRCode from 'qrcode.react';

interface QRCodeModalProps {
    url: string;
    onClose: () => void;
}

export default function QRCodeModal({ url, onClose }: QRCodeModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center">
                <h2 className="text-xl font-semibold mb-4">Partagez cette page</h2>
                <QRCode value={url} size={256} className="mx-auto mb-4" />
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
}