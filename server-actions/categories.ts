'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

// export async function getCategories() {
// 	const session = await getSession();
// 	if (!session) return;

// 	try {
// 		return await prisma.category.findMany({
// 			where: {
// 				ownerId: session.user.id,
// 			},
// 			select: {
// 				id: true,
// 				title: true,
// 				index: true,
// 				links: {
// 					select: {
// 						id: true,
// 						title: true,
// 						url: true,
// 						index: true,
// 					},
// 					orderBy: {
// 						index: 'asc',
// 					},
// 				},
// 			},
// 			orderBy: {
// 				index: 'asc',
// 			},
// 		});
// 	} catch (error) {
// 		return null;
// 	}
// }

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

export async function deleteCategory({
	id,
	index,
}: {
	id: number;
	index: number;
}) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.$transaction(async (prisma) => {
			await prisma.category.updateMany({
				where: {
					index: {
						gt: index,
					},
					ownerId: session.user.id,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});

			await prisma.category.delete({
				where: {
					ownerId: session.user.id,
					id,
				},
			});
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot delete category' };
	}
}
