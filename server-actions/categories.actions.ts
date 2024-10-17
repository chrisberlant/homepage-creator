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
		const { userId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const lastCategory = await prisma.category.findFirst({
					where: {
						userId,
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
						userId,
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
					userId,
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
		const { userId } = ctx;

		try {
			return await prisma.$transaction(async (prisma) => {
				const category = await prisma.category.findUnique({
					where: {
						id,
						userId,
					},
					select: {
						index: true,
						column: true,
					},
				});
				if (!category) throw new Error('Cannot find link');

				const { index: currentIndex, column: currentColumn } = category;

				if (newIndex === currentIndex && newColumn === currentColumn)
					throw new Error(
						'The category is already at the specified location'
					);
				let newIndexPosition = newIndex;

				// If moved in the same column
				if (newColumn === currentColumn) {
					// If no index specified, put it at the end of the column
					if (newIndex === undefined) {
						const highestIndex = await prisma.category.findFirst({
							where: {
								column: currentColumn,
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
								'Cannot find categories in this column'
							);

						if (highestIndex.index === 0)
							throw new Error(
								'The link is already at the specified location'
							);

						await prisma.category.updateMany({
							where: {
								column: currentColumn,
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

						return await prisma.category.update({
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
						await prisma.category.updateMany({
							where: {
								column: currentColumn,
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
						const highestIndex = await prisma.category.findFirst({
							where: {
								column: currentColumn,
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

						await prisma.category.updateMany({
							where: {
								column: currentColumn,
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

					return await prisma.category.update({
						where: {
							id,
							userId,
						},
						data: {
							index: newIndexPosition,
						},
					});
				}

				// If moved in another column
				await prisma.category.updateMany({
					where: {
						column: currentColumn,
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

				const highestIndex = await prisma.category.findFirst({
					where: {
						column: newColumn,
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
					return await prisma.category.update({
						where: {
							id,
							userId,
						},
						data: {
							column: newColumn,
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

				await prisma.category.updateMany({
					where: {
						column: newColumn,
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

				return await prisma.category.update({
					where: {
						id,
						userId,
					},
					data: {
						column: newColumn,
						index: newIndexPosition,
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
		const { userId } = ctx;

		try {
			await prisma.$transaction(async (prisma) => {
				const category = await prisma.category.findUnique({
					where: { id, userId },
				});

				if (!category) throw new Error('Category does not exist');

				await prisma.category.updateMany({
					where: {
						index: {
							gt: category?.index,
						},
						userId,
					},
					data: {
						index: {
							decrement: 1,
						},
					},
				});

				await prisma.link.deleteMany({
					where: { categoryId: id, userId },
				});

				await prisma.category.delete({
					where: {
						id,
						userId,
					},
				});
			});
		} catch (error) {
			throw new Error('Cannot delete category');
		}
	});
