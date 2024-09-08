import { z } from 'zod';
import {
	credentialsSchema,
	updateLinkSchema,
	updatePasswordSchema,
	updateUserSchema,
} from '@/schemas/index.schemas';

export type SessionType = {
	user: { id: number; name: string };
	expires: string;
	iat: number;
	exp: number;
};

export type credentialsType = z.infer<typeof credentialsSchema>;

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

export type updatePasswordType = z.infer<typeof updatePasswordSchema>;
