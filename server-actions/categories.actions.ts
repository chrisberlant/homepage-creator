'use server';

import prisma from '@/lib/prisma';
import { authActionClient } from './safe-actions';
import {
	createCategorySchema,
	moveCategorySchema,
	updateCategorySchema,
} from '@/schemas/categories.schemas';
import { z } from 'zod';

export const createCategory = authActionClient
	.schema(createCategorySchema)
	.action(async ({ parsedInput, ctx }) => {
		const { title, column } = parsedInput;
		const { userId: ownerId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const lastCategory = await prisma.category.findFirst({
					where: {
						ownerId,
						column,
					},
					orderBy: {
						index: 'desc',
					},
				});

				const newIndex =
					lastCategory !== null ? lastCategory.index + 1 : 0;

				return await prisma.category.create({
					data: {
						title,
						index: newIndex,
						column,
						ownerId,
					},
				});
			});
		} catch (error) {
			throw new Error('Cannot create category');
		}
	});

export const updateCategory = authActionClient
	.schema(updateCategorySchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, title } = parsedInput;
		const { userId } = ctx;

		try {
			return await prisma.category.update({
				where: {
					id,
					ownerId: userId,
				},
				data: {
					title,
				},
			});
		} catch (error) {
			throw new Error('Cannot update category');
		}
	});

export const moveCategory = authActionClient
	.schema(moveCategorySchema)
	.action(async ({ parsedInput, ctx }) => {
		const { id, newIndex, newColumn } = parsedInput;
		const { userId: ownerId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const category = await prisma.category.findUnique({
					where: {
						id,
						ownerId,
					},
				});
				if (!category) throw new Error('Cannot find category');

				const { index: currentIndex, column: currentColumn } = category;

				if (newIndex === currentIndex && newColumn === currentColumn)
					throw new Error(
						'The category is already at the specified location'
					);

				// If changing column
				if (newColumn !== currentColumn) {
					// If no index specified, put it at the end of the column
					if (newIndex === undefined) {
						const highestIndex = await prisma.category.findFirst({
							where: {
								ownerId,
								column: currentColumn,
							},
							orderBy: {
								index: 'desc',
							},
						});

						await prisma.category.updateMany({
							where: {
								ownerId,
								column: currentColumn,
								id: {
									not: id,
								},
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

						return await prisma.category.update({
							where: {
								id,
								ownerId,
								column: newColumn,
							},
							data: {
								index:
									highestIndex !== null
										? highestIndex?.index + 1
										: 0,
							},
						});
					}

					// If index is specified
					await prisma.category.updateMany({
						where: {
							ownerId,
							column: currentColumn,
							id: {
								not: id,
							},
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

					await prisma.category.updateMany({
						where: {
							ownerId,
							column: newColumn,
							id: {
								not: id,
							},
							index: {
								gte: newIndex,
							},
						},
						data: {
							index: {
								increment: 1,
							},
						},
					});

					return await prisma.category.update({
						where: {
							id,
							ownerId,
						},
						data: {
							index: newIndex,
							column: newColumn,
						},
					});
				}

				// If column is the same
				// If no index specified, put it at the end of the current column
				if (newIndex === undefined) {
					const highestIndex = await prisma.category.findFirst({
						where: {
							column: currentColumn,
						},
						orderBy: {
							index: 'desc',
						},
					});
					const newIndexPosition =
						highestIndex !== null ? highestIndex?.index + 1 : 0;

					if (newIndexPosition > 0)
						await prisma.category.updateMany({
							where: {
								ownerId,
								column: currentColumn,
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

					return await prisma.category.update({
						where: {
							id,
							ownerId,
						},
						data: {
							index:
								highestIndex !== null
									? highestIndex?.index + 1
									: 0,
						},
					});
				}

				// If index is specified
				if (newIndex < currentIndex) {
					// If new index is smaller than the current one
					await prisma.category.updateMany({
						where: {
							ownerId,
							column: currentColumn,
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
					// If new index is bigger than the current one
					const highestIndex = await prisma.category.findFirst({
						where: {
							ownerId,
							column: currentColumn,
						},
						orderBy: {
							index: 'desc',
						},
					});
					const newIndexPosition =
						highestIndex && newIndex > highestIndex.index
							? highestIndex.index
							: newIndex;

					await prisma.category.updateMany({
						where: {
							ownerId,
							column: currentColumn,
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

				return await prisma.category.update({
					where: {
						id,
						ownerId,
					},
					data: {
						index: newIndex,
					},
				});
			});
		} catch (error) {
			throw new Error('Cannot move category');
		}
	});

export const deleteCategory = authActionClient
	.schema(z.number())
	.action(async ({ parsedInput, ctx }) => {
		const id = parsedInput;
		const { userId: ownerId } = ctx;

		try {
			await prisma.$transaction(async (prisma) => {
				const category = await prisma.category.findUnique({
					where: { id, ownerId },
				});

				if (!category) throw new Error('Category does not exist');

				await prisma.category.updateMany({
					where: {
						index: {
							gt: category?.index,
						},
						ownerId,
					},
					data: {
						index: {
							decrement: 1,
						},
					},
				});

				await prisma.link.deleteMany({
					where: { categoryId: id, ownerId },
				});

				await prisma.category.delete({
					where: {
						id,
						ownerId,
					},
				});
			});
		} catch (error) {
			throw new Error('Cannot delete category');
		}
	});
