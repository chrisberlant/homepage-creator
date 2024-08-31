import { useMutation } from '@tanstack/react-query';
import {
	createLink,
	deleteLink,
	moveLink,
	updateLink,
} from '@/server-actions/links';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import {
	CategoryType,
	CategoryWithLinksType,
	LinkWithCategoryType,
} from '@/lib/types';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

interface UseCreateLinkProps {
	form: UseFormReturn<
		{
			title: string;
			url: string;
		},
		any,
		undefined
	>;
	setOpenedMenu: Dispatch<SetStateAction<boolean>>;
}
// Create a link
export const useCreateLink = ({ form, setOpenedMenu }: UseCreateLinkProps) =>
	useMutation({
		mutationFn: createLink,
		onMutate: async (infos) => {
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
						category.id === infos.categoryId
							? {
									...category,
									links: [
										...category.links,
										{ ...infos, id: 9999 },
									],
							  }
							: category
					)
			);

			return previousCategories;
		},
		onSuccess: (apiResponse: LinkWithCategoryType) => {
			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) =>
						category.id === apiResponse.categoryId
							? {
									...category,
									links: category.links.map((link) =>
										link.id === 9999 ? apiResponse : link
									),
							  }
							: category
					)
			);
			form.reset();
			setOpenedMenu(false);
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
		onMutate: async (linkId) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const oldCategory = previousCategories.find((category) =>
				category.links.some((link) => link.id === linkId)
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
										(link) => link.id !== linkId
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

// Update a link
export const useUpdateLink = () =>
	useMutation({
		mutationFn: updateLink,
		onMutate: async (updatedLink) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryWithLinksType[]) =>
					categories.map((category) => ({
						...category,
						links: category.links.map((link) =>
							link.id === updatedLink.id
								? { ...link, ...updatedLink }
								: link
						),
					}))
			);

			return previousCategories;
		},
		onSuccess: () => toast.success('Link successfully updated'),
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Change index of a link, and category if needed
export const useMoveLink = () =>
	useMutation({
		mutationFn: ({ id, newIndex, newCategoryId }) =>
			moveLink({ id, newIndex, newCategoryId }),
		onMutate: async (updatedLink: {
			id: number;
			currentIndex: number;
			newIndex: number;
			newCategoryId: number;
		}) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});
			const previousCategories: CategoryWithLinksType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const { currentIndex, newIndex, newCategoryId, id } = updatedLink;
			console.log(updatedLink);

			const currentCategory = previousCategories.find((category) =>
				category.links.find((link) => link.id === id)
			);
			const linkInfos = currentCategory?.links.find(
				(link) => link.id === id
			);
			if (!currentCategory || !linkInfos) return;

			// If moved in the same category, if not cache is already updated by updateCache function
			// if (currentCategoryId == newCategoryId) {
			// 	if (currentIndex === newIndex)
			// 		throw new Error(
			// 			'The link is already at the specified location'
			// 		);

			// If no index specified, put the link at the end of the list
			if (newIndex === undefined) {
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) =>
						categories.map((category) =>
							category.id === currentCategory.id
								? {
										...category,
										links: [
											...category.links.filter(
												(link) => link.id !== id
											),
											linkInfos,
										],
								  }
								: category
						)
				);
				// If index is defined
			} else {
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryWithLinksType[]) =>
						categories.map((category) =>
							category.id === currentCategory.id
								? {
										...category,
										links: arrayMove(
											category.links,
											currentIndex,
											newIndex
										),
								  }
								: category
						)
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

export async function updateCache({
	id,
	currentIndex,
	newIndex,
	newCategoryId,
}: {
	id: number;
	currentIndex: number;
	newIndex: number | undefined;
	newCategoryId: number;
}) {
	if (!browserQueryClient) return;
	console.log('cache update', 'new index', newIndex);

	await browserQueryClient.cancelQueries({
		queryKey: ['categories'],
	});
	const previousCategories: CategoryWithLinksType[] | undefined =
		browserQueryClient.getQueryData(['categories']);
	if (!previousCategories || !browserQueryClient) return;

	const currentCategory = previousCategories.find((category) =>
		category.links.find((link) => link.id === id)
	);
	const currentLinkInfos = currentCategory?.links.find(
		(link) => link.id === id
	);
	if (!currentCategory || !currentLinkInfos) return;
	console.log('newIndex query', newIndex);

	// If index is specified
	if (newIndex) {
		console.log('newIndex', newIndex);
		browserQueryClient.setQueryData(
			['categories'],
			(categories: CategoryWithLinksType[]) =>
				categories.map((category) => {
					if (category.id === newCategoryId)
						return {
							...category,
							links: [
								...category.links.map((link) => {
									if (
										category.links.indexOf(link) >=
											newIndex &&
										link.id !== id
									)
										return {
											...link,
											index: link.index + 1,
										};
									return link;
								}),
								{
									...currentLinkInfos,
									index: newIndex,
								},
							],
						};
					if (category.id === currentCategory.id)
						return {
							...category,
							links: category.links
								.filter((link) => link.id !== id)
								.map((link) =>
									link.index > currentIndex
										? {
												...link,
												index: link.index - 1,
										  }
										: link
								),
						};
					return category;
				})
		);
	} else {
		console.log('no index specified', newCategoryId, currentLinkInfos);
		browserQueryClient.setQueryData(
			['categories'],
			(categories: CategoryWithLinksType[]) =>
				categories.map((category) => {
					if (category.id === newCategoryId)
						return {
							...category,
							links: [
								...category.links,
								{
									...currentLinkInfos,
									index: category.links.length,
								},
							],
						};
					if (category.id === currentCategoryId)
						return {
							...category,
							links: category.links
								.filter((link) => link.id !== linkId)
								.map((link) =>
									link.index > currentLinkInfos.index
										? {
												...link,
												index: link.index - 1,
										  }
										: link
								),
						};
					return category;
				})
		);
	}
}
