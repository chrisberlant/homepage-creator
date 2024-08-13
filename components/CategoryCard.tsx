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
import { toast } from 'sonner';

interface CategoryCardProps {
	children: ReactNode;
	id: number;
	index: number;
	title: string;
}

export default function CategoryCard({
	children,
	id,
	index,
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
			if (opened) {
				contentRef.current.style.height = 'auto';
				const height = contentRef.current.scrollHeight;
				contentRef.current.style.height = `${height}px`;
			} else contentRef.current.style.height = '0px';
		}
	}, [opened, children]);

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
						onClick={async () => {
							const result = await deleteCategory({ id, index });
							if (result?.error) toast.error(result.error);
						}}
					/>
				</>
			)}
			<div
				ref={contentRef}
				className={` transition-all duration-500 ease ${
					opened ? 'opacity-100' : 'opacity-0 overflow-hidden'
				}`}
			>
				{children}
			</div>
		</div>
	);
}
