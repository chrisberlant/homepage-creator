'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

interface CreateCategoryProps {
	title: string;
	url: string;
	categoryId: number;
	index: number;
}

export async function createCategory({
	title,
	url,
	categoryId,
	index,
}: CreateCategoryProps) {
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
