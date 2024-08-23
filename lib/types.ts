export type LinkType = {
	id: number;
	title: string;
	url: string;
	index: number;
};

export type CategoryType = {
	id: number;
	title: string;
	index: number;
	links: LinkType[];
};

export type LinkWithCategoryType = LinkType & {
	categoryId: number;
	ownerId: number;
};
