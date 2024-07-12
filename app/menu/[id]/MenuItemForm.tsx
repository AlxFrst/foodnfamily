'use client';

import { useState, FormEvent } from 'react';
import { addMenuItem } from './actions';

interface Category {
    id: number;
    name: string;
}

interface MenuItemFormProps {
    categories: Category[];
    onMenuItemAdded: (menuItem: any, categoryId: number) => void;
}

export default function MenuItemForm({ categories, onMenuItemAdded }: MenuItemFormProps) {
    const [name, setName] = useState('');
    const [stock, setStock] = useState(0);
    const [categoryId, setCategoryId] = useState(categories[0]?.id || 0);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const menuItem = await addMenuItem(categoryId, name, stock);
        onMenuItemAdded(menuItem, categoryId);
        setName('');
        setStock(0);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-xl">
            <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-medium" htmlFor="item-name">
                    Nom du plat
                </label>
                <input
                    id="item-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-medium" htmlFor="item-stock">
                    Stock
                </label>
                <input
                    id="item-stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-medium" htmlFor="category-id">
                    Catégorie
                </label>
                <select
                    id="category-id"
                    value={categoryId}
                    onChange={(e) => setCategoryId(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                Ajouter le plat
            </button>
        </form>

    );
}
