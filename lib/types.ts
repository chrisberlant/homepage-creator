import { z } from 'zod';
import {
	credentialsSchema,
	updateUserSchema,
	updatePasswordSchema,
} from '@/schemas/auth.schemas.ts';
import { createCategorySchema } from '../schemas/categories.schemas';
import { createLinkSchema, updateLinkSchema } from '../schemas/links.schemas';

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

export type CreateLinkType = z.infer<typeof createLinkSchema>;

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

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export type UpdatePasswordType = z.infer<typeof updatePasswordSchema>;

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
