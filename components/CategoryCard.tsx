'use client';

import React, { useContext, useState } from 'react';
import { ArrowBigDown, ArrowBigUp, Trash2Icon } from 'lucide-react';
import CreateLinkButton from './CreateLinkButton';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import LinkCard from './LinkCard';
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDeleteCategory } from '@/queries/categories.queries';
import { CategoryWithLinksType } from '@/lib/types';
import { CSS } from '@dnd-kit/utilities';
import { DraggingCategoryContext } from './providers/DndContextProvider';

export default function CategoryCard({
	id,
	title,
	links,
}: CategoryWithLinksType) {
	const { editingMode } = useContext(EditingModeContext);
	const draggingCategory = useContext(DraggingCategoryContext);
	const { mutate: deleteCategory } = useDeleteCategory();
	const {
		isOver,
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: `container-${id}`,
	});
	const style = {
		// color: isOver ? 'green' : undefined,
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.3 : 1,
		transition,
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
		<SortableContext
			items={links.map((link) => link.id)}
			strategy={verticalListSortingStrategy}
		>
			{draggingCategory ? (
				<div
					ref={setNodeRef}
					style={style}
					{...listeners}
					{...attributes}
					className={`border-2 shadow-md dark:shadow-none bg-card py-2 px-5 m-4 w-1/4 rounded-2xl relative ${
						editingMode ? 'cursor-move' : 'cursor-pointer'
					}`}
				>
					<h2 className='font-bold text-center flex-1'>{title}</h2>
				</div>
			) : (
				<div
					ref={setNodeRef}
					style={style}
					{...listeners}
					{...attributes}
					className={`border-2 shadow-md dark:shadow-none bg-card py-2 px-5 m-4 w-1/4 rounded-2xl relative ${
						editingMode ? 'cursor-move' : 'cursor-pointer'
					}`}
				>
					<div className='flex mb-5'>
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
						<h2 className='font-bold text-center flex-1'>
							{title}
						</h2>
					</div>

					{editingMode && (
						<>
							<CreateLinkButton categoryId={id} />
							<Trash2Icon
								stroke='red'
								className='absolute right-4 top-3 cursor-pointer'
								onClick={() => deleteCategory(id)}
							/>
						</>
					)}
					{opened && !draggingCategory && (
						<div
							// ref={setNodeRef}
							className={`flex flex-col gap-2 transition-all duration-500 ease ${
								opened
									? 'opacity-100'
									: 'opacity-0 overflow-hidden'
							}`}
						>
							{links.map((link) => (
								<LinkCard
									key={link.id}
									id={link.id}
									title={link.title}
									url={link.url}
									categoryId={id}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</SortableContext>
	);
}
