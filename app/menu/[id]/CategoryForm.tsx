'use client';

import { useState, FormEvent } from 'react';
import { addCategory } from './actions';

interface CategoryFormProps {
    menuId: number;
    onCategoryAdded: (category: any) => void;
}

export default function CategoryForm({ menuId, onCategoryAdded }: CategoryFormProps) {
    const [name, setName] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const category = await addCategory(menuId, name);
        onCategoryAdded({ ...category, items: [] });
        setName('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-xl">
            <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-medium" htmlFor="category-name">
                    Nom de la catégorie
                </label>
                <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                Ajouter la catégorie
            </button>
        </form>

    );
}
