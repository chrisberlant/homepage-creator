'use server';

import prisma from '@/lib/prisma';
import { authActionClient } from './safe-actions';
import {
	createLinkSchema,
	moveLinkSchema,
	updateLinkSchema,
} from '@/schemas/links.schemas';
import { z } from 'zod';

export const createLink = authActionClient
	.schema(createLinkSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { title, url, categoryId } = parsedInput;
		const { userId: ownerId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const lastLinkInCategory = await prisma.link.findFirst({
					where: {
						categoryId,
						ownerId,
					},
					orderBy: {
						index: 'desc',
					},
				});

				const newIndex =
					lastLinkInCategory !== null
						? lastLinkInCategory.index + 1
						: 0;

				const createdLink = await prisma.link.create({
					data: {
						title,
						url,
						index: newIndex,
						categoryId,
						ownerId,
					},
				});
				const { index, ownerId: owner, ...infos } = createdLink;
				return infos;
			});
		} catch (error) {
			throw new Error('Cannot create link');
		}
	});

export const updateLink = authActionClient
	.schema(updateLinkSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, title, url } = parsedInput;
		const { userId } = ctx;

		try {
			return await prisma.link.update({
				where: {
					id,
					ownerId: userId,
				},
				data: {
					title,
					url,
				},
			});
		} catch (error) {
			throw new Error('Cannot update link');
		}
	});

export const moveLink = authActionClient
	.schema(moveLinkSchema)
	.action(async ({ parsedInput, ctx }) => {
		try {
			const { id, newIndex, newCategoryId } = parsedInput;
			const { userId } = ctx;

			return await prisma.$transaction(async (prisma) => {
				const link = await prisma.link.findUnique({
					where: {
						id,
						ownerId: userId,
					},
				});
				if (!link) throw new Error('Cannot find link');

				const { index: currentIndex, categoryId: currentCategoryId } =
					link;
				let newIndexPosition = 0;

				if (
					newIndex === currentIndex &&
					currentCategoryId === newCategoryId
				)
					throw new Error(
						'The link is already at the specified location'
					);

				// If moved in the same category
				if (currentCategoryId === newCategoryId) {
					// If no index specified, put it at the end of the category
					if (newIndex === undefined) {
						const highestIndex = await prisma.link.findFirst({
							where: {
								categoryId: newCategoryId,
								ownerId: userId,
							},
							orderBy: {
								index: 'desc',
							},
						});

						return await prisma.link.update({
							where: {
								id,
								ownerId: userId,
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
						newIndexPosition = newIndex <= -1 ? 0 : newIndex;

						await prisma.link.updateMany({
							where: {
								ownerId: userId,
								id: {
									not: id,
								},
								index: {
									gte: newIndexPosition,
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
						const highestIndex = await prisma.link.findFirst({
							where: {
								ownerId: userId,
								categoryId: currentCategoryId,
							},
							orderBy: {
								index: 'desc',
							},
						});

						newIndexPosition =
							highestIndex && newIndex > highestIndex.index
								? highestIndex.index
								: newIndex;

						await prisma.link.updateMany({
							where: {
								id: {
									not: id,
								},
								ownerId: userId,
								index: {
									lte: newIndexPosition,
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
							ownerId: userId,
						},
						data: {
							index: newIndexPosition,
							categoryId: newCategoryId,
						},
					});
				}

				// If moved in another category
				if (newIndex === undefined) {
					// If no index specified, put it at the end of the list
					const highestIndex = await prisma.link.findFirst({
						where: {
							ownerId: userId,
							categoryId: newCategoryId,
						},
						orderBy: {
							index: 'desc',
						},
					});

					return await prisma.link.update({
						where: {
							id,
							ownerId: userId,
						},
						data: {
							categoryId: newCategoryId,
							index:
								highestIndex !== null
									? highestIndex.index + 1
									: 0,
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
						ownerId: userId,
					},
					data: {
						index: {
							decrement: 1,
						},
					},
				});

				const highestIndex = await prisma.link.findFirst({
					where: {
						categoryId: newCategoryId,
						ownerId: userId,
					},
					orderBy: {
						index: 'desc',
					},
				});

				newIndexPosition =
					highestIndex && newIndex > highestIndex.index + 1
						? highestIndex.index + 1
						: newIndex;

				await prisma.link.updateMany({
					where: {
						id: {
							not: id,
						},
						ownerId: userId,
						index: {
							gte: newIndexPosition,
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
						ownerId: userId,
					},
					data: {
						categoryId: newCategoryId,
						index: newIndexPosition,
					},
				});
			});
		} catch (error) {
			throw new Error('Cannot move link');
		}
	});

export const deleteLink = authActionClient
	.schema(z.number())
	.action(async ({ parsedInput, ctx }) => {
		const id = parsedInput;
		const { userId: ownerId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const link = await prisma.link.delete({
					where: {
						id,
						ownerId,
					},
				});

				await prisma.link.updateMany({
					where: {
						id: {
							not: id,
						},
						ownerId,
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
	});
