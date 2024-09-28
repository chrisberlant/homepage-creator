import {
	CategoryType,
	CategoryWithLinksType,
	MoveCategoryType,
} from '@/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import fetchApiFromClient from '@/utils/fetchApiFromClient';
import {
	createCategory,
	deleteCategory,
	moveCategory,
	updateCategory,
} from '@/server-actions/categories.actions';
import { toast } from 'sonner';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { UseFormReturn } from 'react-hook-form';
import { arrayMove } from '@dnd-kit/sortable';
import { Dispatch, SetStateAction } from 'react';

export const useGetCategories = () =>
	useQuery({
		queryKey: ['categories'],
		queryFn: async () =>
			(await fetchApiFromClient(
				'/api/categories'
			)) as CategoryWithLinksType[],
	});

// Create a category
export const useCreateCategory = (
	form: UseFormReturn<
		{
			title: string;
			column: number;
		},
		any,
		undefined
	>
) =>
	useMutation({
		mutationFn: createCategory,
		onMutate: async ({ title, column }) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) => [
					...categories,
					{ title, id: undefined, column, links: [] },
				]
			);

			return previousCategories;
		},
		onSuccess: (apiResponse) => {
			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) =>
						category.id === undefined
							? {
									...category,
									id: apiResponse?.data?.id,
							  }
							: category
					)
			);
			toast.success('Category successfully created');
			form.reset();
		},
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Update title of a category
export const useUpdateCategory = ({
	setEditingTitle,
	setDisabledDragging,
}: {
	setEditingTitle: React.Dispatch<React.SetStateAction<boolean>>;
	setDisabledDragging: Dispatch<SetStateAction<boolean>>;
}) =>
	useMutation({
		mutationFn: updateCategory,
		onMutate: async ({ id, title }) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const currentTitle = previousCategories.find(
				(category) => category.id === id
			)?.title;

			if (currentTitle === title) throw new Error('No data modified');

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === id ? { ...category, title } : category
					)
			);

			return previousCategories;
		},
		onSuccess: () => {
			toast.success('Category successfully updated');
			setEditingTitle(false);
			setDisabledDragging(false);
		},
		onError: (error, __, previousCategories) => {
			if (error.message === 'No data modified') {
				toast.info(error.message);
				setEditingTitle(false);
				return setDisabledDragging(false);
			}
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
			setEditingTitle(false);
			setDisabledDragging(false);
		},
	});

// Change index of a category
export const useMoveCategory = () =>
	useMutation({
		mutationFn: ({ id, newColumn, newIndex }) =>
			moveCategory({ id, newColumn, newIndex }),
		onMutate: async (updatedCategory: MoveCategoryType) => {
			if (!browserQueryClient) return;
			const { newIndex, newColumn, id } = updatedCategory;
			await browserQueryClient.cancelQueries({
				queryKey: ['categories'],
			});
			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient.getQueryData(['categories']);
			if (!previousCategories) return;
			const categoryToMove = previousCategories.find(
				(category) => category.id === id
			);
			if (!categoryToMove) return;

			if (newIndex === undefined) {
				// If no index specified, put the category at the end of the column
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) => {
						const categoriesWithSameColumn = categories.filter(
							(category) =>
								category.column === newColumn &&
								category.id !== id
						);
						// Add the moved category to the end of the array
						categoriesWithSameColumn.push(categoryToMove);

						const categoriesWithDifferentColumn = categories.filter(
							(category) => category.column !== newColumn
						);

						return [
							...categoriesWithDifferentColumn,
							...categoriesWithSameColumn,
						];
					}
				);
			} else {
				// If index is defined
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) => {
						const categoriesWithSameColumn = categories.filter(
							(category) =>
								category.column === newColumn &&
								category.id !== id
						);
						// Add the moved category to specified index
						categoriesWithSameColumn.splice(
							newIndex,
							0,
							categoryToMove
						);

						const categoriesWithDifferentColumn = categories.filter(
							(category) => category.column !== newColumn
						);

						return [
							...categoriesWithDifferentColumn,
							...categoriesWithSameColumn,
						];
					}
				);
			}

			return previousCategories;
		},

		onSuccess: () => toast.success('Category successfully moved'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Update the elements when moving a category from a column to another
export async function updateCategoriesPosition({
	id,
	newColumn,
}: {
	id: number;
	newColumn: number;
}) {
	if (!browserQueryClient) return;

	await browserQueryClient.cancelQueries({
		queryKey: ['categories'],
	});
	const previousCategories: CategoryWithLinksType[] | undefined =
		browserQueryClient.getQueryData(['categories']);
	if (!previousCategories || !browserQueryClient) return;

	browserQueryClient.setQueryData(
		['categories'],
		(categories: CategoryWithLinksType[]) =>
			categories.map((category) =>
				category.id === id
					? {
							...category,
							column: newColumn,
					  }
					: category
			)
	);
}

// Delete a category
export const useDeleteCategory = () =>
	useMutation({
		mutationFn: deleteCategory,
		onMutate: async (categoryId) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.filter((category) => category.id !== categoryId)
			);

			return previousCategories;
		},
		onSuccess: () => toast.success('Category successfully deleted'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});
