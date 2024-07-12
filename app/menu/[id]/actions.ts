'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function addCategory(menuId: number, name: string) {
    try {
        const category = await prisma.category.create({
            data: {
                name,
                menu: { connect: { id: menuId } },
            },
        });
        return category;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la catégorie', error);
        throw error;
    }
}

export async function deleteCategory(categoryId: number) {
    try {
        await prisma.category.delete({
            where: { id: categoryId },
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie', error);
        throw error;
    }
}

export async function addMenuItem(categoryId: number, name: string, stock: number) {
    try {
        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                stock,
                category: { connect: { id: categoryId } },
            },
        });
        return menuItem;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du plat', error);
        throw error;
    }
}

export async function deleteMenuItem(menuItemId: number) {
    try {
        await prisma.menuItem.delete({
            where: { id: menuItemId },
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du plat', error);
        throw error;
    }
}

export async function updateMenuItemStock(menuItemId: number, stock: number) {
    try {
        const menuItem = await prisma.menuItem.update({
            where: { id: menuItemId },
            data: { stock },
        });
        return menuItem;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du stock', error);
        throw error;
    }
}

export async function updateMenuName(menuId: number, newName: string) {
    try {
        const updatedMenu = await prisma.menu.update({
            where: { id: menuId },
            data: { name: newName },
        });
        return updatedMenu;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du nom du menu', error);
        throw error;
    }
}

export async function createOrder(menuId: number, userName: string, items: { itemId: number, quantity: number }[]) {
    try {
        const order = await prisma.order.create({
            data: {
                menu: { connect: { id: menuId } },
                userName,
                items: {
                    create: items.map(item => ({
                        item: { connect: { id: item.itemId } },
                        quantity: item.quantity,
                    })),
                },
            },
        });
        // remove items from stock
        for (const item of items) {
            await prisma.menuItem.update({
                where: { id: item.itemId },
                data: { stock: { decrement: item.quantity } },
            });
        }
        return order;
    } catch (error) {
        console.error('Erreur lors de la création de la commande', error);
        throw error;
    }
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: {
                items: {
                    include: {
                        item: true,
                    },
                },
            },
        });
        return updatedOrder;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande', error);
        throw error;
    }
}

export async function archiveOrder(orderId: number) {
    try {
        const archivedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'ARCHIVED' },
        });
        return archivedOrder;
    } catch (error) {
        console.error('Erreur lors de l\'archivage de la commande', error);
        throw error;
    }
}

export async function deleteMenu(menuId: number) {
    await prisma.menu.delete({
        where: { id: menuId },
    });
}