import { useMutation } from '@tanstack/react-query';
import { changeLinkCategory, updateLink } from '../server-actions/links';
import { browserQueryClient } from '../components/providers/QueryClientProvider';
import { CategoryType } from '../lib/types';
import { toast } from 'sonner';

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

			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
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
		onError: (_, __, previousCategories) => {
			toast.error('Cannot update link');
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});

// Change category of a link
export const useChangeLinkCategory = () =>
	useMutation({
		mutationFn: changeLinkCategory,
		onMutate: async (updatedLink) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);

			const linkInfos = previousCategories?.find(
				(category) => category.id === updatedLink.oldCategoryId
			)?.links[updatedLink.index];

			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) => {
						// Update the old category links and their indexes
						if (category.id === updatedLink.oldCategoryId)
							return {
								...category,
								links: category.links
									.filter(
										(link) => link.id !== updatedLink.id
									)
									.map((link) =>
										link.index > updatedLink.index
											? { ...link, index: link.index - 1 }
											: link
									),
							};
						// Update the moved link index and its new category
						if (category.id === updatedLink.newCategoryId) {
							const highestIndex = Math.max(
								...category.links.map((link) => link.index)
							);
							const newIndex =
								highestIndex != -Infinity
									? highestIndex + 1
									: 0;

							const updatedLinkWithNewIndex = {
								...linkInfos,
								index: newIndex,
							};
							return {
								...category,
								links: [
									...category.links,
									updatedLinkWithNewIndex,
								],
							};
						}
						return category;
					})
			);

			return previousCategories;
		},
		onSuccess: () => toast.success('Link successfully moved'),
		onError: (_, __, previousCategories) => {
			toast.error('Cannot change link category');
			browserQueryClient?.setQueryData(
				['categories'],
				previousCategories
			);
		},
	});
