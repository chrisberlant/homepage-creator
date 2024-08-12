'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

export async function createCategory(title: string) {
	const session = await getSession();
	if (!session) return;
	try {
		await prisma.$transaction(async (prisma) => {
			const lastCategory = await prisma.category.findFirst({
				where: {
					ownerId: session.user.id,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex = lastCategory?.index ? lastCategory.index + 1 : 0;

			await prisma.category.create({
				data: {
					title,
					index: newIndex,
					ownerId: session.user.id,
				},
			});
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot create category' };
	}
}

export async function deleteCategory(id: number) {
	const session = await getSession();
	if (!session) return;
	try {
		await prisma.category.delete({
			where: {
				ownerId: session.user.id,
				id,
			},
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot delete category' };
	}
}
