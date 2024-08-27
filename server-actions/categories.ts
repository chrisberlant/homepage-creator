'use server';

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { CategoryType } from '@/lib/types';

export async function createCategory(title: string) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		return await prisma.$transaction(async (prisma) => {
			const lastCategory = await prisma.category.findFirst({
				where: {
					ownerId: session.user.id,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex = lastCategory?.index ? lastCategory.index + 1 : 0;

			return (await prisma.category.create({
				data: {
					title,
					index: newIndex,
					ownerId: session.user.id,
				},
			})) as CategoryType;
		});
	} catch (error) {
		throw new Error('Cannot create category');
	}
}

export async function updateCategory({
	id,
	title,
}: {
	id: number;
	title: string;
}) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		return await prisma.category.update({
			where: {
				id,
				ownerId: session.user.id,
			},
			data: {
				title,
			},
		});
	} catch (error) {
		throw new Error('Cannot update category');
	}
}

export async function deleteCategory(id: number) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		await prisma.$transaction(async (prisma) => {
			const category = await prisma.category.findUnique({
				where: { id, ownerId: session.user.id },
			});

			if (!category) throw new Error('Category does not exist');

			await prisma.category.updateMany({
				where: {
					index: {
						gt: category?.index,
					},
					ownerId: session.user.id,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});

			await prisma.link.deleteMany({
				where: { categoryId: id, ownerId: session.user.id },
			});

			await prisma.category.delete({
				where: {
					id,
					ownerId: session.user.id,
				},
			});
		});
	} catch (error) {
		throw new Error('Cannot delete category');
	}
}
