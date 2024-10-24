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
import { LinkType } from '@/lib/types';
import { CSS } from '@dnd-kit/utilities';
import { DraggingCategoryContext } from './providers/DndContextProvider';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import CategoryTitle from './CategoryTitle';
import { Button } from './ui/button';
import DeleteCategoryButton from './DeleteCategoryButton';
import { useGetCategories } from '../queries/categories.queries';

interface CategoryCardProps {
	id: number;
	title: string;
	column: number;
	links: LinkType[];
}

export default function CategoryCard({
	id,
	title,
	column,
	links,
}: CategoryCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const draggingCategory = useContext(DraggingCategoryContext);
	const { disabledDragging } = useContext(DisabledDraggingContext);
	const { data: categories } = useGetCategories();
	const currentCategory = categories?.find((category) => category.id === id);

	const {
		isOver,
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: `category-${id}`,
		data: {
			column,
			type: 'category',
		},
		disabled: disabledDragging,
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
			<div
				ref={setNodeRef}
				style={style}
				{...listeners}
				{...attributes}
				className={`relative rounded-2xl border-2 bg-card px-5 py-3 shadow-md dark:shadow-none ${
					editingMode ? 'cursor-move' : 'cursor-default'
				}`}
			>
				{draggingCategory ? (
					<h2 className='flex-1 text-center font-bold'>{title}</h2>
				) : (
					<>
						<div
							className={`relative ${
								editingMode ? '' : 'mb-5'
							} flex items-center justify-center`}
						>
							{currentCategory &&
								currentCategory?.links.length > 0 && (
									<Button
										variant='ghost'
										className='absolute -left-4 px-1 py-0'
										onClick={toggleView}
									>
										{opened ? (
											<ArrowBigUp />
										) : (
											<ArrowBigDown />
										)}
									</Button>
								)}
							<CategoryTitle id={id} defaultTitle={title} />
						</div>

						{editingMode && (
							<div className='mb-2 flex justify-between'>
								<CreateLinkButton categoryId={id} />
								<DeleteCategoryButton id={id} title={title} />
							</div>
						)}

						{opened && (
							<div
								// ref={setNodeRef}
								className={`ease flex flex-col gap-2 transition-all duration-500 ${
									opened
										? 'opacity-100'
										: 'overflow-hidden opacity-0'
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
					</>
				)}
			</div>
		</SortableContext>
	);
}
