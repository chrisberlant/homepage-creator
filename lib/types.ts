import { z } from 'zod';
import {
	loginSchema,
	updateUserSchema,
	updatePasswordSchema,
} from '@/schemas/auth.schemas.ts';
import {
	createCategorySchema,
	moveCategorySchema,
	updateCategorySchema,
} from '@/schemas/categories.schemas';
import {
	createLinkSchema,
	moveLinkSchema,
	updateLinkSchema,
	urlObjectSchema,
	urlSchema,
} from '../schemas/links.schemas';

export type SessionType = {
	user: { id: number; name: string };
	expires: string;
	iat: number;
	exp: number;
};

export type loginType = z.infer<typeof loginSchema>;

export type LinkType = {
	id: number;
	title: string;
	url: string;
};

export type LinkWithCategoryType = LinkType & {
	categoryId: number;
};

export type CreateLinkType = z.infer<typeof createLinkSchema>;

export type UpdateLinkType = z.infer<typeof updateLinkSchema>;

export type MoveLinkType = z.infer<typeof moveLinkSchema>;

export type UrlObjectType = z.infer<typeof urlObjectSchema>;

export type CategoryType = {
	id: number;
	title: string;
	column: number;
};

export type CategoryWithLinksType = CategoryType & {
	links: LinkType[];
};

export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;

export type UserType = {
	username: string;
	email: string;
};

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export type UpdatePasswordType = z.infer<typeof updatePasswordSchema>;

export type CreateCategoryType = z.infer<typeof createCategorySchema>;

export type MoveCategoryType = z.infer<typeof moveCategorySchema>;
