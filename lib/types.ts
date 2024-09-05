import { z } from 'zod';
import { updateLinkSchema } from '../schemas/index.schemas';

export type LinkType = {
	id: number;
	title: string;
	url: string;
};

export type LinkWithCategoryType = LinkType & {
	categoryId: number;
};

export type CategoryType = {
	id: number;
	title: string;
};

export type CategoryWithLinksType = CategoryType & {
	links: LinkType[];
};

export type updateLinkType = z.infer<typeof updateLinkSchema>;
