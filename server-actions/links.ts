'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';
import console from 'console';

interface CreateLinkProps {
	title: string;
	url: string;
	categoryId: number;
}

export async function createLink({ title, url, categoryId }: CreateLinkProps) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.$transaction(async (prisma) => {
			const lastLink = await prisma.link.findFirst({
				where: {
					ownerId: session.user.id,
					categoryId,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex = lastLink?.index ? lastLink.index + 1 : 0;

			await prisma.link.create({
				data: {
					title,
					url,
					index: newIndex,
					categoryId,
					ownerId: session.user.id,
				},
			});
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot create link' };
	}
}

export async function deleteLink(id: number) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.link.delete({
			where: {
				id,
				ownerId: session.user.id,
			},
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot delete link' };
	}
}

export async function updateLink({
	id,
	title,
	url,
}: {
	id: number;
	title: string;
	url: string;
}) {
	const session = await getSession();
	if (!session) return;

	try {
		return await prisma.link.update({
			where: {
				id,
				ownerId: session.user.id,
			},
			data: {
				title,
				url,
			},
		});
	} catch (error) {
		return { error: 'Cannot update link' };
	}
}

export async function changeLinkIndex({
	id,
	newIndex,
	newCategoryId,
}: {
	id: number;
	newIndex: number;
	newCategoryId: number;
}) {
	const session = await getSession();
	if (!session) return;
	try {
		await prisma.$transaction(async (prisma) => {
			const link = await prisma.link.findUnique({
				where: {
					id,
					ownerId: session.user.id,
				},
			});
			if (!link) throw new Error('Cannot find link');

			const { index: currentIndex, categoryId: currentCategoryId } = link;

			if (
				newIndex === currentIndex &&
				currentCategoryId === newCategoryId
			)
				throw new Error(
					'The link is already at the specified location'
				);

			await prisma.link.update({
				where: {
					id,
					ownerId: session.user.id,
				},
				data: {
					index: newIndex,
					categoryId: newCategoryId,
				},
			});

			// If moved in the same category
			if (currentCategoryId === newCategoryId) {
				if (newIndex < currentIndex)
					return await prisma.link.updateMany({
						where: {
							ownerId: session.user.id,
							id: {
								not: id,
							},
							index: {
								gte: newIndex,
								lt: currentIndex,
							},
							categoryId: currentCategoryId,
						},
						data: {
							index: {
								increment: 1,
							},
						},
					});

				// If new index is bigger than the current one
				return await prisma.link.updateMany({
					where: {
						id: {
							not: id,
						},
						ownerId: session.user.id,
						index: {
							lte: newIndex,
							gt: currentIndex,
						},
						categoryId: currentCategoryId,
					},
					data: {
						index: {
							decrement: 1,
						},
					},
				});
			}

			// If moved in another category
			await prisma.link.updateMany({
				where: {
					id: {
						not: id,
					},
					ownerId: session.user.id,
					index: {
						gte: newIndex,
					},
					categoryId: newCategoryId,
				},
				data: {
					index: {
						increment: 1,
					},
				},
			});

			return prisma.link.updateMany({
				where: {
					id: {
						not: id,
					},
					ownerId: session.user.id,
					index: {
						gt: currentIndex,
					},
					categoryId: currentCategoryId,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});
		});
	} catch (error) {
		return { error: 'Cannot change link index' };
	}
}

// When moved to a new category without specific index
export async function changeLinkCategory({
	id,
	newCategoryId,
}: {
	id: number;
	newCategoryId: number;
}) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.$transaction(async (prisma) => {
			const link = await prisma.link.findUnique({
				where: {
					id,
					ownerId: session.user.id,
				},
			});

			if (!link) throw new Error('Cannot find link');
			if (link.categoryId === newCategoryId)
				throw new Error('Link is already in this category');

			const { index, categoryId: oldCategoryId } = link;

			await prisma.link.updateMany({
				where: {
					index: {
						gt: index,
					},
					categoryId: oldCategoryId,
					ownerId: session.user.id,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});

			const highestIndex = await prisma.link.findFirst({
				where: {
					ownerId: session.user.id,
					categoryId: newCategoryId,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex =
				highestIndex && highestIndex?.index !== null
					? highestIndex.index + 1
					: 0;

			const updatedLink = await prisma.link.update({
				where: {
					id,
					ownerId: session.user.id,
				},
				data: {
					categoryId: newCategoryId,
					index: newIndex,
				},
			});
			const { title, url } = updatedLink;
			const returnedValue = {
				id,
				title,
				url,
				index: newIndex,
			};

			return returnedValue;
		});
	} catch (error) {
		return { error: 'Cannot change link category' };
	}
}
