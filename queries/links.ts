import { useMutation } from '@tanstack/react-query';
import {
	changeLinkCategory,
	changeLinkIndex,
	createLink,
	deleteLink,
	updateLink,
} from '@/server-actions/links';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { CategoryType, LinkWithCategoryType } from '@/lib/types';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';

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

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
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
		onSuccess: (infos: LinkWithCategoryType) => {
			browserQueryClient?.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) =>
						category.id === infos.categoryId
							? {
									...category,
									links: category.links.map((link) =>
										link.id === 9999
											? {
													...link,
													id: infos.id,
													index: infos.index,
											  }
											: link
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

			const previousCategories: CategoryType[] | undefined =
				browserQueryClient?.getQueryData(['categories']);
			if (!previousCategories || !browserQueryClient) return;

			const oldCategory = previousCategories.find((category) =>
				category.links.some((link) => link.id === linkId)
			);
			const linkIndex = oldCategory?.links.find(
				(link) => link.id === linkId
			)?.index;
			if (!linkIndex || !oldCategory) return;

			browserQueryClient.setQueryData(
				['categories'],
				(categories: CategoryType[]) =>
					categories.map((category) =>
						category.id === oldCategory.id
							? {
									...category,
									links: category.links
										.filter((link) => link.id !== linkId)
										.map((link) =>
											link.index > linkIndex
												? {
														...link,
														index: link.index - 1,
												  }
												: link
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
		onError: (error, __, previousCategories) => {
			toast.error(error.message);
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
								].sort((a, b) => a.index - b.index),
							};
						}
						return category;
					})
			);

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

			const oldCategory = previousCategories.find((category) =>
				category.links.some((link) => link.id === updatedLink.id)
			);
			const oldLinkInfos = oldCategory?.links.find(
				(link) => link.id === updatedLink.id
			);
			const oldCategoryId = oldCategory?.id;
			const { newIndex, newCategoryId, id: linkId } = updatedLink;

			if (!oldLinkInfos) throw new Error('Link cannot be found');

			// If moved in the same category
			if (oldCategoryId == newCategoryId) {
				if (oldLinkInfos.index === newIndex)
					throw new Error(
						'The link is already at the specified location'
					);

				// If new index is smaller than the current one
				if (updatedLink.newIndex < oldLinkInfos.index) {
					browserQueryClient.setQueryData(
						['categories'],
						(categories: CategoryType[]) =>
							categories.map((category) =>
								category.id === oldCategoryId
									? {
											...category,
											links: category.links
												.map((link) => {
													if (
														link.id ===
														updatedLink.id
													)
														return {
															...link,
															index: updatedLink.newIndex,
														};
													if (
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

													return link;
												})
												.sort(
													(a, b) => a.index - b.index
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
										links: category.links
											.map((link) => {
												if (link.id === updatedLink.id)
													return {
														...link,
														index: updatedLink.newIndex,
													};
												if (
													link.index <=
														updatedLink.newIndex &&
													link.index >
														oldLinkInfos.index
												)
													return {
														...link,
														index: link.index - 1,
													};

												return link;
											})
											.sort((a, b) => a.index - b.index),
								  }
								: category
						)
				);
			} else {
				// If moved in another category
				browserQueryClient.setQueryData(
					['categories'],
					(categories: CategoryType[]) =>
						categories.map((category) => {
							if (category.id === newCategoryId)
								return {
									...category,
									links: [
										...category.links.map((link) => {
											if (
												link.id !== linkId &&
												link.index >= newIndex
											)
												return {
													...link,
													index: link.index + 1,
												};
											return link;
										}),
										{
											...oldLinkInfos,
											index: newIndex,
										},
									].sort((a, b) => a.index - b.index),
								};
							if (category.id === oldCategoryId)
								return {
									...category,
									links: category.links
										.filter((link) => link.id !== linkId)
										.map((link) => {
											if (link.index > newIndex)
												return {
													...link,
													index: link.index - 1,
												};
											return link;
										})
										.sort((a, b) => a.index - b.index),
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
