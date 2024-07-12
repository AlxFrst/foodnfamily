'use client';

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
interface PasswordModalProps {
    onSubmit: (password: string) => void;
}

export default function PasswordModal({ onSubmit }: PasswordModalProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Votre menu est créé !</h2>
                <p className="text-gray-700 mb-4">
                    Vous pouvez maintenant vous y connecter avec le mot de passe que vous avez choisi lors de la création du menu.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    {/* Bouton de retour on click go on home page */}
                    <div className="flex justify-end">
                    <a href="/" className="bg-yellow-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">
                        Retour
                    </a>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Soumettre
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
