'use client';

import { useState } from 'react';
import PasswordModal from './PasswordModal';
import CategoryForm from './CategoryForm';
import MenuItemForm from './MenuItemForm';
import { deleteCategory, deleteMenuItem, updateMenuItemStock, updateMenuName, deleteMenu } from './actions';

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

interface PasswordProtectedMenuProps {
    menuId: number;
    adminPwd: string;
    menuName: string;
    categories: Category[];
}

export default function PasswordProtectedMenu({ menuId, adminPwd, menuName: initialMenuName, categories: initialCategories }: PasswordProtectedMenuProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [menuName, setMenuName] = useState(initialMenuName);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isEditingName, setIsEditingName] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handlePasswordSubmit = (enteredPwd: string) => {
        if (enteredPwd === adminPwd) {
            setIsAuthenticated(true);
        } else {
            alert('Mot de passe incorrect');
        }
    };

    const handleMenuNameChange = async () => {
        try {
            await updateMenuName(menuId, menuName);
            setIsEditingName(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du nom du menu', error);
        }
    };

    const handleCategoryAdded = (category: Category) => {
        setCategories([...categories, category]);
    };

    const handleMenuItemAdded = (menuItem: MenuItem, categoryId: number) => {
        setCategories(categories.map(category =>
            category.id === categoryId ? { ...category, items: [...category.items, menuItem] } : category
        ));
    };

    const handleCategoryDelete = async (categoryId: number) => {
        await deleteCategory(categoryId);
        setCategories(categories.filter(category => category.id !== categoryId));
    };

    const handleMenuItemDelete = async (menuItemId: number, categoryId: number) => {
        await deleteMenuItem(menuItemId);
        setCategories(categories.map(category =>
            category.id === categoryId ? { ...category, items: category.items.filter(item => item.id !== menuItemId) } : category
        ));
    };

    const handleMenuItemStockUpdate = async (menuItemId: number, categoryId: number, stock: number) => {
        const updatedItem = await updateMenuItemStock(menuItemId, stock);
        setCategories(categories.map(category =>
            category.id === categoryId ? {
                ...category,
                items: category.items.map(item => item.id === menuItemId ? updatedItem : item)
            } : category
        ));
    };

    const handleDeleteMenu = async () => {
        try {
            await deleteMenu(menuId);
            window.location.href = '/'; // Rediriger vers la page d'accueil ou autre page
        } catch (error) {
            console.error('Erreur lors de la suppression du menu', error);
        }
    };

    return (
        <div className="relative p-4 max-w-md mx-auto">
            {!isAuthenticated && <PasswordModal onSubmit={handlePasswordSubmit} />}
            <div className={`p-4 ${!isAuthenticated ? 'blur-sm' : ''}`}>
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        {isEditingName ? (
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    onClick={handleMenuNameChange}
                                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Sauvegarder
                                </button>
                                <button
                                    onClick={() => setIsEditingName(false)}
                                    className="bg-gray-500 text-white font-medium py-2 px-4 rounded-lg ml-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Annuler
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <span>{menuName}</span>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Modifier
                                </button>
                            </div>
                        )}
                    </h1>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        Supprimer le menu
                    </button>
                </div>
                {isAuthenticated && (
                    <>
                        <CategoryForm menuId={menuId} onCategoryAdded={handleCategoryAdded} />
                        <MenuItemForm categories={categories} onMenuItemAdded={handleMenuItemAdded} />
                        {categories.map(category => (
                            <div key={category.id} className="mb-4 relative">
                                <h2 className="text-xl font-semibold">{category.name}</h2>
                                <button
                                    onClick={() => handleCategoryDelete(category.id)}
                                    className="bg-red-500 text-white font-medium py-1 px-2 rounded-lg absolute top-0 right-0 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {category.items.map(item => (
                                        <div key={item.id} className="bg-white shadow-md rounded-lg p-4 relative">
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <div className="mt-2">
                                                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor={`stock-${item.id}`}>
                                                    Stock
                                                </label>
                                                <input
                                                    id={`stock-${item.id}`}
                                                    type="number"
                                                    value={item.stock}
                                                    onChange={(e) => handleMenuItemStockUpdate(item.id, category.id, parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="absolute top-2 right-2 flex space-x-2">
                                                <button
                                                    onClick={() => handleMenuItemDelete(item.id, category.id)}
                                                    className="bg-red-500 text-white font-medium py-1 px-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleMenuItemStockUpdate(item.id, category.id, item.stock)}
                                                    className="bg-blue-500 text-white font-medium py-1 px-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-semibold mb-4">Supprimer le menu</h2>
                        <p>Êtes-vous sûr de vouloir supprimer ce menu ? Cette action est irréversible.</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteMenu}
                                className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
