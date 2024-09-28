import { useMutation } from '@tanstack/react-query';
import {
	createLink,
	deleteLink,
	moveLink,
	updateLink,
} from '@/server-actions/links.actions';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { CategoryWithLinksType, MoveLinkType } from '@/lib/types';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

interface UseCreateLinkProps {
	form: UseFormReturn<
		{
			title: string;
			url: string;
			categoryId: number;
		},
		any,
		undefined
	>;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setDisabledDragging: Dispatch<SetStateAction<boolean>>;
}
// Create a link
export const useCreateLink = ({
	form,
	setOpen,
	setDisabledDragging,
}: UseCreateLinkProps) =>
	useMutation({
		mutationFn: createLink,
		onMutate: async (data) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === data.categoryId
							? {
									...category,
									links: [
										...category.links,
										{
											title: data.title,
											url: data.url,
											id: 9999,
										},
									],
							  }
							: category
					)
			);

			return previousCategories;
		},
		onSuccess: (apiResponse) => {
			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === apiResponse?.data?.categoryId
							? {
									...category,
									links: category.links.map((link) =>
										link.id === 9999
											? {
													...link,
													id: apiResponse?.data?.id,
											  }
											: link
									),
							  }
							: category
					)
			);
			form.reset();
			setOpen(false);
			setDisabledDragging(false);
			toast.success('Link successfully created');
		},
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Delete a link
export const useDeleteLink = () =>
	useMutation({
		mutationFn: deleteLink,
		onMutate: async (id) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const oldCategory = previousCategories.find((category) =>
				category.links.some((link) => link.id === id)
			);

			if (!oldCategory) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === oldCategory.id
							? {
									...category,
									links: category.links.filter(
										(link) => link.id !== id
									),
							  }
							: category
					)
			);

			return previousCategories;
		},
		onSuccess: () => toast.success('Link successfully deleted'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

interface UseUpdateLinkProps {
	form: UseFormReturn<
		{
			id: number;
			title?: string | undefined;
			url?: string | undefined;
		},
		any,
		undefined
	>;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setDisabledDragging: Dispatch<SetStateAction<boolean>>;
}
// Update a link
export const useUpdateLink = ({
	form,
	setOpen,
	setDisabledDragging,
}: UseUpdateLinkProps) =>
	useMutation({
		mutationFn: updateLink,
		onMutate: async (updatedLink) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);

			const currentCategory = previousCategories?.find((category) =>
				category.links.some((link) => link.id === updatedLink.id)
			);
			const currentLink = currentCategory?.links.find(
				(link) => link.id === link.id
			);
			if (
				!previousCategories ||
				!currentCategory ||
				!currentLink ||
				!browserQueryClient
			)
				return;

			if (JSON.stringify(currentLink) === JSON.stringify(updatedLink))
				throw new Error('No data modified');

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === currentCategory.id
							? {
									...category,
									links: category.links.map((link) =>
										link.id === updatedLink.id
											? { ...link, ...updatedLink }
											: link
									),
							  }
							: category
					)
			);

			return previousCategories;
		},
		onSuccess: (apiResponse) => {
			form.reset(apiResponse?.data);
			setOpen(false);
			setDisabledDragging(false);
			toast.success('Link successfully updated');
		},
		onError: (error, __, previousCategories) => {
			if (error.message === 'No data modified')
				return toast.info(error.message);
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Change index of a link
export const useMoveLink = () =>
	useMutation({
		mutationFn: moveLink,
		onMutate: async (updatedLink: MoveLinkType) => {
			if (!browserQueryClient) return;
			const { newIndex, id } = updatedLink;
			await browserQueryClient.cancelQueries({
				queryKey: ['categories'],
			});
			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient.getQueryData(['categories']);
			if (!previousCategories) return;

			const currentCategory = previousCategories.find((category) =>
				category.links.some((link) => link.id === id)
			);
			const linkToMove = currentCategory?.links.find(
				(link) => link.id === id
			);
			if (!currentCategory || !linkToMove) return;

			if (newIndex === undefined) {
				// If no index specified, put the link at the end of the list
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) =>
						categories.map((category) => {
							if (category.id === currentCategory.id)
								return {
									...category,
									links: arrayMove(
										category.links,
										category.links.indexOf(linkToMove),
										category.links.length - 1
									),
								};
							return category;
						})
				);
			} else {
				// If index is defined
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) =>
						categories.map((category) => {
							if (category.id === currentCategory.id)
								return {
									...category,
									links: arrayMove(
										category.links,
										category.links.indexOf(linkToMove),
										newIndex
									),
								};
							return category;
						})
				);
			}

			return previousCategories;
		},

		onSuccess: () => toast.success('Link successfully moved'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Update the elements when moving a link from a category to another
export async function updateLinksPosition({
	id,
	newCategoryId,
	newIndex,
}: {
	id: number;
	newCategoryId: number;
	newIndex: number | undefined;
}) {
	if (!browserQueryClient) return;

	await browserQueryClient.cancelQueries({
		queryKey: ['categories'],
	});
	const previousCategories: CategoryWithLinksType[] | undefined =
		browserQueryClient.getQueryData(['categories']);
	const currentCategory = previousCategories?.find((category) =>
		category.links.find((link) => link.id === id)
	);
	const linkToMove = currentCategory?.links.find((link) => link.id === id);
	if (!previousCategories || !currentCategory || !linkToMove) return;

	// TODO arrayMove ?
	if (newIndex === undefined) {
		return browserQueryClient.setQueryData(
			['categories'],
			(categories: CategoryWithLinksType[]) =>
				categories.map((category) => {
					if (category.id === newCategoryId)
						return {
							...category,
							links: [...category.links, linkToMove],
						};
					if (category.id === currentCategory.id)
						return {
							...category,
							links: category.links.filter(
								(link) => link.id !== id
							),
						};
					return category;
				})
		);
	}

	// If index is defined
	return browserQueryClient.setQueryData(
		['categories'],
		(categories: CategoryWithLinksType[]) =>
			categories.map((category) => {
				if (category.id === newCategoryId) {
					const filteredLinks = category.links.filter(
						(link) => link.id !== id
					);
					filteredLinks.push(linkToMove);
					return {
						...category,
						links: filteredLinks,
					};
				}
				if (category.id === currentCategory.id)
					return {
						...category,
						links: category.links.filter((link) => link.id !== id),
					};
				return category;
			})
	);
}
