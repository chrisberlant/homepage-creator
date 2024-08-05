'use client';
import { DndContext } from '@dnd-kit/core';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	function handleDragEnd(event: any) {
		console.log(event);
	}

	return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
