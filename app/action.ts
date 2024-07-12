'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createMenu(name: string, adminPwd: string) {
    try {
        const newMenu = await prisma.menu.create({
            data: {
                name,
                adminPwd,
            },
        });
        return newMenu;
    } catch (error) {
        console.error('Erreur lors de la création du menu', error);
        throw error;
    }
}

export async function getMenus() {
    try {
        const menus = await prisma.menu.findMany();
        return menus;
    } catch (error) {
        console.error('Erreur lors de la récupération des menus', error);
        throw error;
    }
}
