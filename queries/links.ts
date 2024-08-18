import { useMutation } from '@tanstack/react-query';
import { updateLink } from '../server-actions/links';
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

			const previousCategories = browserQueryClient?.getQueryData([
				'categories',
			]);

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
