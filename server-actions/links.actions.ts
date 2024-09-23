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
		const { userId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const lastLinkInCategory = await prisma.link.findFirst({
					where: {
						categoryId,
						userId,
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
						userId,
					},
				});
				const { index, userId: owner, ...infos } = createdLink;
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
					userId,
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
		const { id, newIndex, newCategoryId } = parsedInput;
		const { userId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const link = await prisma.link.findUnique({
					where: {
						id,
						userId,
					},
					select: {
						index: true,
						categoryId: true,
					},
				});
				if (!link) throw new Error('Cannot find link');

				const { index: currentIndex, categoryId: currentCategoryId } =
					link;

				const newCategory = await prisma.category.findUnique({
					where: {
						id: currentCategoryId,
						userId,
					},
					select: {
						id: true,
					},
				});

				if (!newCategory) throw new Error('The category does exist');

				if (
					newIndex === currentIndex &&
					newCategoryId === currentCategoryId
				)
					throw new Error(
						'The link is already at the specified location'
					);

				let newIndexPosition = newIndex;

				// If moved in the same category
				if (newCategoryId === currentCategoryId) {
					// If no index specified, put it at the end of the category
					if (newIndex === undefined) {
						const highestIndex = await prisma.link.findFirst({
							where: {
								categoryId: currentCategoryId,
								userId,
							},
							orderBy: {
								index: 'desc',
							},
							select: {
								index: true,
							},
						});

						if (highestIndex === null)
							throw new Error(
								'Cannot find links in this category'
							);

						if (highestIndex.index === 0)
							throw new Error(
								'The link is already at the specified location'
							);

						await prisma.link.updateMany({
							where: {
								categoryId: currentCategoryId,
								userId,
								index: {
									gt: currentIndex,
								},
							},
							data: {
								index: {
									decrement: 1,
								},
							},
						});

						return await prisma.link.update({
							where: {
								id,
								userId,
							},
							data: {
								index: highestIndex.index,
							},
						});
					}

					if (newIndex < currentIndex) {
						// If new index is smaller than the current one
						await prisma.link.updateMany({
							where: {
								categoryId: currentCategoryId,
								userId,
								id: {
									not: id,
								},
								index: {
									gte: newIndex,
									lt: currentIndex,
								},
							},
							data: {
								index: {
									increment: 1,
								},
							},
						});
					} else {
						// If newIndex > currentIndex
						const highestIndex = await prisma.link.findFirst({
							where: {
								categoryId: currentCategoryId,
								userId,
							},
							orderBy: {
								index: 'desc',
							},
							select: {
								index: true,
							},
						});

						// New index can only be inferior or equal to highest current index
						if (highestIndex && newIndex > highestIndex.index)
							newIndexPosition = highestIndex.index;

						await prisma.link.updateMany({
							where: {
								categoryId: currentCategoryId,
								userId,
								id: {
									not: id,
								},
								index: {
									lte: newIndexPosition,
									gt: currentIndex,
								},
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
							userId,
						},
						data: {
							index: newIndexPosition,
						},
					});
				}

				// If moved in another category
				await prisma.link.updateMany({
					where: {
						categoryId: currentCategoryId,
						userId,
						index: {
							gt: currentIndex,
						},
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
						userId,
					},
					orderBy: {
						index: 'desc',
					},
					select: {
						index: true,
					},
				});

				if (newIndex === undefined) {
					// If no index specified, put it at the end of the list
					return await prisma.link.update({
						where: {
							id,
							categoryId: newCategoryId,
							userId,
						},
						data: {
							index:
								highestIndex !== null
									? highestIndex.index + 1
									: 0,
						},
					});
				}

				// If index is specified
				newIndexPosition =
					highestIndex && newIndex > highestIndex.index + 1
						? highestIndex.index + 1
						: newIndex;

				await prisma.link.updateMany({
					where: {
						categoryId: newCategoryId,
						id: {
							not: id,
						},
						userId,
						index: {
							gte: newIndexPosition,
						},
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
						userId,
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
		const { userId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const link = await prisma.link.delete({
					where: {
						id,
						userId,
					},
				});

				await prisma.link.updateMany({
					where: {
						id: {
							not: id,
						},
						userId,
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
