import { z } from 'zod';
import { updateLinkSchema, updateUserSchema } from '@/schemas/index.schemas';

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

export type UserType = {
	username: string;
	email: string;
};

export type updateUserType = z.infer<typeof updateUserSchema>;
