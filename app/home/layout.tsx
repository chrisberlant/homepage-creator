'use client';
import { DndContext } from '@dnd-kit/core';
import { changeLinkCategory } from '../../server-actions/links';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	async function handleDragEnd(event: any) {
		console.log(event);
		await changeLinkCategory({
			id: event.active.id,
			newCategoryId: event.over.id,
		});
	}

	return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
