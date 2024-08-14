'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from './auth';

interface CreateLinkProps {
	title: string;
	url: string;
	categoryId: number;
}

export async function createLink({ title, url, categoryId }: CreateLinkProps) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.$transaction(async (prisma) => {
			const lastLink = await prisma.link.findFirst({
				where: {
					ownerId: session.user.id,
					categoryId,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex = lastLink?.index ? lastLink.index + 1 : 0;

			await prisma.link.create({
				data: {
					title,
					url,
					index: newIndex,
					categoryId,
					ownerId: session.user.id,
				},
			});
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot create link' };
	}
}

export async function deleteLink(id: number) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.link.delete({
			where: {
				id,
				ownerId: session.user.id,
			},
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot delete link' };
	}
}

export async function changeLinkCategory({
	id,
	index,
	categoryId,
	newCategoryId,
}: {
	id: number;
	index: number;
	categoryId: number;
	newCategoryId: number;
}) {
	const session = await getSession();
	if (!session) return;

	try {
		await prisma.$transaction(async (prisma) => {
			await prisma.link.updateMany({
				where: {
					index: {
						gt: index,
					},
					categoryId,
					ownerId: session.user.id,
				},
				data: {
					index: {
						decrement: 1,
					},
				},
			});

			const highestIndex = await prisma.link.findFirst({
				where: {
					ownerId: session.user.id,
					categoryId: newCategoryId,
				},
				orderBy: {
					index: 'desc',
				},
			});

			const newIndex =
				highestIndex && highestIndex?.index !== null
					? highestIndex.index + 1
					: 0;

			await prisma.link.update({
				where: {
					id,
					ownerId: session.user.id,
				},
				data: {
					categoryId: newCategoryId,
					index: newIndex,
				},
			});
		});

		revalidatePath('/home');
	} catch (error) {
		return { error: 'Cannot change link category' };
	}
}
