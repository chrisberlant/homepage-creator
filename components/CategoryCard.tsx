'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ArrowBigDown, ArrowBigUp, Trash2Icon } from 'lucide-react';
import { deleteCategory } from '../server-actions/categories';
import CreateLinkButton from './CreateLinkButton';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { toast } from 'sonner';
import LinkCard from './LinkCard';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface CategoryCardProps {
	id: number;
	index: number;
	title: string;
	links: {
		id: number;
		title: string;
		url: string;
		index: number;
	}[];
}

export default function CategoryCard({
	id,
	index,
	title,
	links,
}: CategoryCardProps) {
	// const [items, setItems] = useState(links);

	const { editingMode } = useContext(EditingModeContext);
	const { isOver, setNodeRef } = useDroppable({
		id,
	});
	const style = {
		color: isOver ? 'green' : undefined,
	};
	const [opened, setOpened] = useState(true);
	// const contentRef = useRef<HTMLDivElement>(null);

	const toggleView = () => setOpened(!opened);

	// useEffect(() => {
	// 	if (contentRef.current) {
	// 		if (opened) {
	// 			contentRef.current.style.height = 'auto';
	// 			const height = contentRef.current.scrollHeight;
	// 			contentRef.current.style.height = `${height}px`;
	// 		} else contentRef.current.style.height = '0px';
	// 	}
	// }, [opened]);

	return (
		<SortableContext items={links} strategy={verticalListSortingStrategy}>
			<div
				ref={setNodeRef}
				style={style}
				className='border-2 shadow-md dark:shadow-none bg-card p-2 px-5 m-4 w-1/3 rounded-2xl relative'
			>
				<div className='flex mb-4'>
					{opened ? (
						<ArrowBigUp
							onClick={toggleView}
							className='absolute cursor-pointer'
						/>
					) : (
						<ArrowBigDown
							onClick={toggleView}
							className='absolute cursor-pointer'
						/>
					)}
					<h2 className='font-bold text-center flex-1'>{title}</h2>
				</div>
				{editingMode && (
					<>
						<CreateLinkButton categoryId={id} />
						<Trash2Icon
							stroke='red'
							className='absolute right-4 top-3 cursor-pointer'
							onClick={async () => {
								const result = await deleteCategory(id);
								if (result?.error) toast.error(result.error);
							}}
						/>
					</>
				)}
				{opened && (
					<div
						// ref={setNodeRef}
						className={`flex flex-col gap-2 transition-all duration-500 ease ${
							opened ? 'opacity-100' : 'opacity-0 overflow-hidden'
						}`}
					>
						{links?.map((link) => (
							<LinkCard
								key={link.id}
								id={link.id}
								index={link.index}
								title={link.title}
								url={link.url}
								categoryId={id}
							/>
						))}
					</div>
				)}
			</div>
		</SortableContext>
	);
}
