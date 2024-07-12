'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Edit, Trash, Check, X, PlusCircle, ClipboardList, Eye } from 'lucide-react';
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

    useEffect(() => {
        const storedPassword = Cookies.get(`menu_${menuId}_pwd`);
        if (storedPassword && storedPassword === adminPwd) {
            setIsAuthenticated(true);
        }
    }, [menuId, adminPwd]);

    const handlePasswordSubmit = (enteredPwd: string) => {
        if (enteredPwd === adminPwd) {
            Cookies.set(`menu_${menuId}_pwd`, enteredPwd, { expires: 30 }); // Expire in 30 days
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
        <div className="relative min-h-screen bg-gray-100">
            {!isAuthenticated && <PasswordModal onSubmit={handlePasswordSubmit} />}
            <div className={`p-4 ${!isAuthenticated ? 'blur-sm' : ''}`}>
                <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
                    <div className="container mx-auto p-4 flex justify-between items-center">
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
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsEditingName(false)}
                                        className="bg-gray-500 text-white font-medium py-2 px-4 rounded-lg ml-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <span>{menuName}</span>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg ml-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            )}
                        </h1>
                        <div className="flex space-x-2">
                            <a className="bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center" href={`/menu/${menuId}/preparation`}>
                                <ClipboardList size={16} className="mr-2" />
                            </a>
                            <a className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center" href={`/menu/${menuId}/carte`}>
                                <Eye size={16} className="mr-2" />
                            </a>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                </header>
                <main className="pt-24 container mx-auto">
                    {isAuthenticated && (
                        <>
                            <div className="my-4">
                                <CategoryForm menuId={menuId} onCategoryAdded={handleCategoryAdded} />
                            </div>
                            <div className="my-4">
                                <MenuItemForm categories={categories} onMenuItemAdded={handleMenuItemAdded} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map(category => (
                                    <div key={category.id} className="bg-white shadow-md rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-semibold">{category.name}</h2>
                                            <button
                                                onClick={() => handleCategoryDelete(category.id)}
                                                className="bg-red-500 text-white font-medium py-1 px-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {category.items.map(item => (
                                                <div key={item.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                                        <div className="mt-2">
                                                            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor={`stock-${item.id}`}>
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
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleMenuItemDelete(item.id, category.id)}
                                                            className="bg-red-500 text-white font-medium py-1 px-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMenuItemStockUpdate(item.id, category.id, item.stock)}
                                                            className="bg-blue-500 text-white font-medium py-1 px-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
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
