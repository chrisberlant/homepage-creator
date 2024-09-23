import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/jwt';

export async function GET() {
	const session = await getSession();
	if (!session) return NextResponse.json(null);

	const categories = await prisma.category.findMany({
		where: {
			userId: session.user.id,
		},
		select: {
			id: true,
			title: true,
			column: true,
			links: {
				select: {
					id: true,
					title: true,
					url: true,
				},
				orderBy: {
					index: 'asc',
				},
			},
		},
		orderBy: {
			index: 'asc',
		},
	});

	if (!categories) return NextResponse.json(null);

	return NextResponse.json(categories);
}
