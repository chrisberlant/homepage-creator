'use client';

import React, {
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ArrowBigDown, ArrowBigUp, Trash2Icon } from 'lucide-react';
import { deleteCategory } from '../server-actions/categories';
import CreateLinkButton from './CreateLinkButton';
import { EditingModeContext } from './EditingModeContextProvider';

interface CategoryCardProps {
	children: ReactNode;
	id: number;
	title: string;
}

export default function CategoryCard({
	children,
	id,
	title,
}: CategoryCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const { isOver, setNodeRef } = useDroppable({
		id,
	});
	const style = {
		color: isOver ? 'green' : undefined,
	};
	const [opened, setOpened] = useState(true);
	const contentRef = useRef<HTMLDivElement>(null);

	const toggleView = () => setOpened(!opened);

	useEffect(() => {
		if (contentRef.current) {
			contentRef.current.style.height = opened
				? `${contentRef.current.scrollHeight}px`
				: '0px';
		}
	}, [opened]);

	return (
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
						onClick={async () => await deleteCategory(id)}
					/>
				</>
			)}
			<div
				ref={contentRef}
				className={`overflow-hidden transition-all duration-300 ease ${
					opened ? 'opacity-1' : 'opacity-30'
				}`}
			>
				{children}
			</div>
		</div>
	);
}
