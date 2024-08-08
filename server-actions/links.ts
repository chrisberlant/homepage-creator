'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

interface CreateLinkProps {
	title: string;
	url: string;
	categoryId: number;
	index: number;
}

export async function createLink({
	title,
	url,
	categoryId,
	index,
}: CreateLinkProps) {
	const session = await getSession();
	if (!session) return;
	try {
		const link = await prisma.link.create({
			data: {
				title,
				url,
				index,
				categoryId,
				ownerId: session.user.id,
			},
		});
		if (!link) return { error: 'Cannot create link' };
		revalidatePath('/home');
	} catch (error) {
		throw error;
	}
}

export async function deleteLink(id: number) {
	const session = await getSession();
	if (!session) return;
	try {
		const deletedLink = await prisma.link.delete({
			where: {
				id,
				ownerId: session.user.id,
			},
		});
		if (!deletedLink) return { error: 'Cannot delete link' };
		revalidatePath('/home');
	} catch (error) {
		throw error;
	}
}

export async function changeLinkCategory({
	id,
	newCategoryId,
}: {
	id: number;
	newCategoryId: number;
}) {
	const session = await getSession();
	if (!session) return;
	try {
		const movedLink = await prisma.link.update({
			where: {
				id,
				ownerId: session.user.id,
			},
			data: {
				categoryId: newCategoryId,
			},
		});
		if (!movedLink) return { error: 'Cannot change link category' };
		revalidatePath('/home');
	} catch (error) {
		throw error;
	}
}
