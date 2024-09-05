'use server';

import prisma from '@/lib/prisma';
import { getSession } from './auth.actions';
import { LinkWithCategoryType } from '@/lib/types';
import { link } from 'fs';

interface CreateLinkProps {
	title: string;
	url: string;
	categoryId: number;
}

export async function createLink({ title, url, categoryId }: CreateLinkProps) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		return await prisma.$transaction(async (prisma) => {
			const lastLinkInCategory = await prisma.link.findFirst({
				where: {
					ownerId: session.user.id,
					categoryId,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex =
				lastLinkInCategory !== null ? lastLinkInCategory.index + 1 : 0;

			const createdLink = await prisma.link.create({
				data: {
					title,
					url,
					index: newIndex,
					categoryId,
					ownerId: session.user.id,
				},
			});
			const { ownerId, ...infos } = createdLink;
			return infos;
		});
	} catch (error) {
		throw new Error('Cannot create link');
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
	if (!session) throw new Error('Session not found or invalid');

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
		throw new Error('Cannot update link');
	}
}

export async function moveLink({
	id,
	newIndex,
	newCategoryId,
}: {
	id: number;
	newIndex?: number | undefined;
	newCategoryId: number;
}) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		return await prisma.$transaction(async (prisma) => {
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

			// If moved in the same category
			if (currentCategoryId === newCategoryId) {
				// If no index specified, put it at the end of the list
				if (newIndex === undefined) {
					const highestIndex = await prisma.link.findFirst({
						where: {
							ownerId: session.user.id,
							categoryId: newCategoryId,
						},
						orderBy: {
							index: 'desc',
						},
					});

					return await prisma.link.update({
						where: {
							id,
							ownerId: session.user.id,
						},
						data: {
							index:
								highestIndex !== null
									? highestIndex?.index + 1
									: 0,
						},
					});
				}

				if (newIndex < currentIndex) {
					// If new index is smaller than the current one
					await prisma.link.updateMany({
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
				} else {
					// If new index is bigger than the current one
					await prisma.link.updateMany({
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

				return await prisma.link.update({
					where: {
						id,
						ownerId: session.user.id,
					},
					data: {
						index: newIndex,
						categoryId: newCategoryId,
					},
				});
			}

			// If moved in another category
			if (newIndex === undefined) {
				// If no index specified, put it at the end of the list
				const highestIndex = await prisma.link.findFirst({
					where: {
						ownerId: session.user.id,
						categoryId: newCategoryId,
					},
					orderBy: {
						index: 'desc',
					},
				});

				return await prisma.link.update({
					where: {
						id,
						ownerId: session.user.id,
					},
					data: {
						categoryId: newCategoryId,
						index:
							highestIndex !== null ? highestIndex.index + 1 : 0,
					},
				});
			}

			// If index is specified
			await prisma.link.updateMany({
				where: {
					index: {
						gt: currentIndex,
					},
					categoryId: currentCategoryId,
					ownerId: session.user.id,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});

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

			return await prisma.link.update({
				where: {
					id,
					ownerId: session.user.id,
				},
				data: {
					categoryId: newCategoryId,
					index: newIndex,
				},
			});
		});
	} catch (error) {
		throw new Error('Cannot move link');
	}
}

export async function deleteLink(id: number) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		return await prisma.$transaction(async (prisma) => {
			const link = await prisma.link.delete({
				where: {
					id,
					ownerId: session.user.id,
				},
			});

			await prisma.link.updateMany({
				where: {
					ownerId: session.user.id,
					id: {
						not: id,
					},
					index: {
						gt: link.index,
					},
					categoryId: link.categoryId,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});
		});
	} catch (error) {
		throw new Error('Cannot delete link');
	}
}
