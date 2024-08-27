import { CategoryType, CategoryWithLinksType } from '@/lib/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import fetchApiFromClient from '@/utils/fetchApiFromClient';
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from '@/server-actions/categories';
import { toast } from 'sonner';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { UseFormReturn } from 'react-hook-form';

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
		},
		any,
		undefined
	>
) =>
	useMutation({
		mutationFn: createCategory,
		onMutate: async (infos) => {
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
					{ title: infos, id: 9999, links: [] },
				]
			);

			return previousCategories;
		},
		onSuccess: (apiResponse: CategoryType) => {
			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) =>
						category.id === 9999
							? {
									...apiResponse,
									links: [],
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

// Update a category
export const useUpdateCategory = () =>
	useMutation({
		mutationFn: updateCategory,
		onMutate: async ({ id, title }) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === id ? { ...category, title } : category
					)
			);

			return previousCategories;
		},
		onSuccess: () => toast.success('Category successfully updated'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

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
