'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ShimmerButton from '@/components/magicui/shimmer-button';
import { createMenu } from './action';

export default function CreateMenuModal() {
    const [showModal, setShowModal] = useState(false);
    const [adminPwd, setAdminPwd] = useState('');
    const [menuName, setMenuName] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const newMenu = await createMenu(menuName, adminPwd);
            router.push(`/menu/${newMenu.id}`);
            setShowModal(false);
        } catch (error) {
            console.error('Erreur lors de la création du menu', error);
        }
    };

    return (
        <>
            <ShimmerButton className="shadow-lg transition-transform transform hover:scale-105" onClick={() => setShowModal(true)}>
                <span className="text-center text-sm font-medium text-white lg:text-lg">
                    Créer mon menu !
                </span>
            </ShimmerButton>

            {showModal && (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className="relative w-full max-w-2xl mx-auto my-6">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                                    <h3 className="text-2xl font-semibold">Créer un nouveau menu</h3>
                                    <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="menu-name">
                                                Nom du menu
                                            </label>
                                            <input
                                                id="menu-name"
                                                type="text"
                                                placeholder="Entrer un nom de menu"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={menuName}
                                                onChange={(e) => setMenuName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                                                Mot de passe administrateur
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                placeholder="Entrer un mot de passe"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={adminPwd}
                                                onChange={(e) => setAdminPwd(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <button
                                                className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 mr-2"
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                className="bg-blue-500 text-white font-medium px-4 py-2 rounded hover:bg-blue-600"
                                                type="submit"
                                            >
                                                Créer
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
