import { useMutation } from '@tanstack/react-query';
import {
	changeLinkCategory,
	changeLinkIndex,
	updateLink,
} from '../server-actions/links';
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
			if (!previousCategories || !browserQueryClient) return;

			const link = previousCategories
				.map((category) => {
					const link = category.links.find(
						(link) => link.id === updatedLink.id
					);
					if (link)
						return {
							oldCategoryId: category.id,
							oldLinkInfos: link,
						};
				})
				.filter((item) => item !== undefined)[0];
			if (!link) throw new Error('Link cannot be found');

			const { oldCategoryId, oldLinkInfos } = link;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) => {
						// Update the old category links and their indexes
						if (category.id === oldCategoryId)
							return {
								...category,
								links: category.links
									.filter(
										(link) => link.id !== updatedLink.id
									)
									.map((link) =>
										link.index > oldLinkInfos.index
											? {
													...link,
													index: link.index - 1,
											  }
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
								...oldLinkInfos,
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

// Change index of a link, and category if needed
export const useChangeLinkIndex = () =>
	useMutation({
		mutationFn: changeLinkIndex,
		onMutate: async (updatedLink) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['categories'],
			});

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const link = previousCategories
				.map((category) => {
					const link = category.links.find(
						(link) => link.id === updatedLink.id
					);
					if (link)
						return {
							oldCategoryId: category.id,
							oldLinkInfos: link,
						};
				})
				.filter((item) => item !== undefined)[0];
			if (!link) throw new Error('Link cannot be found');

			const { oldCategoryId, oldLinkInfos } = link;

			// If moved in the same category
			if (oldCategoryId == updatedLink.newCategoryId) {
				if (oldLinkInfos.index === updatedLink.newIndex)
					throw new Error(
						'The link is already at the specified location'
					);

				if (updatedLink.newIndex < oldLinkInfos.index) {
					browserQueryClient.setQueryData(
						['categories'],
						(categories: CategoryType[]) =>
							categories.map((category) =>
								category.id === oldCategoryId
									? {
											...category,
											links: category.links.map(
												(link) => {
													if (
														link.id !==
															updatedLink.id &&
														link.index >=
															updatedLink.newIndex &&
														link.index <
															oldLinkInfos.index
													)
														return {
															...link,
															index:
																link.index + 1,
														};
													if (
														link.id ===
														updatedLink.id
													)
														return {
															...link,
															index: updatedLink.newIndex,
														};
													return link;
												}
											),
									  }
									: category
							)
					);
				}
				// If new index is bigger than the current one
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryType[]) =>
						categories.map((category) =>
							category.id === oldCategoryId
								? {
										...category,
										links: category.links.map((link) => {
											if (
												link.id !== updatedLink.id &&
												link.index <=
													updatedLink.newIndex &&
												link.index > oldLinkInfos.index
											)
												return {
													...link,
													index: link.index - 1,
												};
											if (link.id === updatedLink.id)
												return {
													...link,
													index: updatedLink.newIndex,
												};
											return link;
										}),
								  }
								: category
						)
				);
			}

			// If moved in another category
			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) => {
						if (category.id === updatedLink.newCategoryId)
							return {
								...category,
								links: [
									...category.links.map((link) => {
										if (
											link.id !== updatedLink.id &&
											link.index >= updatedLink.newIndex
										)
											return {
												...link,
												index: link.index + 1,
											};
										return link;
									}),
									{
										...oldLinkInfos,
										index: updatedLink.newIndex,
									},
								].sort((a, b) => a.index - b.index),
							};

						if (category.id === oldCategoryId)
							return {
								...category,
								links: category.links
									.filter(
										(link) => link.id !== updatedLink.id
									)
									.map((link) => {
										if (link.index > updatedLink.newIndex)
											return {
												...link,
												index: link.index - 1,
											};
										return link;
									}),
							};
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
