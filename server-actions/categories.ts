'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

export async function createCategory(title: string) {
	const session = await getSession();
	if (!session) return;
	try {
		const lastCategory = await prisma.category.findFirst({
			where: {
				ownerId: session.user.id,
			},
			orderBy: {
				index: 'desc',
			},
		});

		const newIndex = lastCategory?.index ? lastCategory.index + 1 : 0;

		const category = await prisma.category.create({
			data: {
				title,
				index: newIndex,
				ownerId: session.user.id,
			},
		});
		if (!category) return { error: 'Cannot create category' };
		revalidatePath('/home');
	} catch (error) {
		throw error;
	}
}

export async function deleteCategory(id: number) {
	const session = await getSession();
	if (!session) return;
	try {
		const deletedCategory = await prisma.category.delete({
			where: {
				ownerId: session.user.id,
				id,
			},
		});
		if (!deletedCategory) return { error: 'Cannot delete category' };
		revalidatePath('/home');
	} catch (error) {
		throw error;
	}
}
