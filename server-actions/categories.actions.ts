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
				});
				if (!category) throw new Error('Cannot find category');

				const { index: currentIndex, column: currentColumn } = category;

				if (newIndex === currentIndex && newColumn === currentColumn)
					throw new Error(
						'The category is already at the specified location'
					);

				// If moved in the same column
				if (newColumn === currentColumn) {
					// If no index specified, put it at the end of the current column
					if (newIndex === undefined) {
						const highestIndex = await prisma.category.findFirst({
							where: {
								id: {
									not: id,
								},
								column: currentColumn,
								userId,
							},
							orderBy: {
								index: 'desc',
							},
						});

						const newIndexPosition =
							highestIndex !== null ? highestIndex.index + 1 : 0;
						// TODO Fix
						if (newIndexPosition > 0)
							await prisma.category.updateMany({
								where: {
									userId,
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
								userId,
							},
							data: {
								index: newIndexPosition,
							},
						});
					}

					// If index is specified
					if (newIndex < currentIndex) {
						// If new index is smaller than the current one
						await prisma.category.updateMany({
							where: {
								userId,
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
								userId,
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
								userId,
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
							userId,
						},
						data: {
							index: newIndex,
						},
					});
				}

				// If moved in another column

				// If no index specified, put it at the end of the column
				if (newIndex === undefined) {
					const highestIndex = await prisma.category.findFirst({
						where: {
							userId,
							column: newColumn,
						},
						orderBy: {
							index: 'desc',
						},
					});

					await prisma.category.updateMany({
						where: {
							userId,
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
					const newIndexPosition =
						highestIndex !== null ? highestIndex?.index + 1 : 0;
					// TODO Fix
					return await prisma.category.update({
						where: {
							id,
							userId,
							column: newColumn,
						},
						data: {
							index: newIndexPosition,
						},
					});
				}

				// If index is specified
				await prisma.category.updateMany({
					where: {
						userId,
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
						userId,
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
						userId,
					},
					data: {
						index: newIndex,
						column: newColumn,
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
