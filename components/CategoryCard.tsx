'use client';

import React, { useContext, useState } from 'react';
import {
	ArrowBigDown,
	ArrowBigUp,
	FolderPenIcon,
	Trash2Icon,
} from 'lucide-react';
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
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import EditCategoryTitleForm from './EditCategoryTitleForm';
import { Button } from './ui/button';

export default function CategoryCard({
	id,
	title,
	links,
}: CategoryWithLinksType) {
	const { editingMode } = useContext(EditingModeContext);
	const draggingCategory = useContext(DraggingCategoryContext);
	const { disabledDragging } = useContext(DisabledDraggingContext);

	const [editingTitle, setEditingTitle] = useState(false);
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
		disabled: disabledDragging,
	});
	const style = {
		// color: isOver ? 'green' : undefined,
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.3 : 1,
		transition,
	};

	const [opened, setOpened] = useState(true);

	const { setDisabledDragging } = useContext(DisabledDraggingContext);

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
					className='border-2 shadow-md dark:shadow-none bg-card py-3 px-5 m-4 w-1/4 rounded-2xl relative'
				>
					<h2 className='font-bold text-center flex-1'>{title}</h2>
				</div>
			) : (
				<div
					ref={setNodeRef}
					style={style}
					{...listeners}
					{...attributes}
					className={`border-2 shadow-md dark:shadow-none bg-card pt-3 pb-3 px-5 m-4 w-1/4 rounded-2xl relative ${
						editingMode ? 'cursor-move pt-1' : 'cursor-default'
					}`}
				>
					<div className='flex mb-5 relative justify-center items-center'>
						<Button
							variant='ghost'
							className='py-0 px-1 absolute -left-4'
							onClick={toggleView}
						>
							{opened ? <ArrowBigUp /> : <ArrowBigDown />}
						</Button>
						{editingMode && !editingTitle && (
							<Button
								variant='ghost'
								className='mr-2 py-1 px-2'
								onClick={() => {
									setEditingTitle(!editingTitle);
									setDisabledDragging(true);
								}}
							>
								<FolderPenIcon className='size-4' />
							</Button>
						)}
						{editingTitle ? (
							<EditCategoryTitleForm
								id={id}
								defaultTitle={title}
								setEditingTitle={setEditingTitle}
							/>
						) : (
							<h2 className='font-bold'>{title}</h2>
						)}
					</div>

					{editingMode && (
						<div className='flex justify-between'>
							<CreateLinkButton categoryId={id} />
							<Button
								variant='ghost'
								className='mb-2 py-1 px-2'
								onClick={() => deleteCategory(id)}
							>
								<Trash2Icon stroke='red' />
							</Button>
						</div>
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
