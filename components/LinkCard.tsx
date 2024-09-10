'use client';

import React, { useContext, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LinkCardEditButton from './LinkCardEditButton';
import { useDeleteLink } from '@/queries/links.queries';
import { LinkWithCategoryType } from '@/lib/types';
import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';

export default function LinkCard({
	id,
	title,
	url,
	categoryId,
}: LinkWithCategoryType) {
	const { editingMode } = useContext(EditingModeContext);
	const { disabledDragging } = useContext(DisabledDraggingContext);
	const { mutate: deleteLink } = useDeleteLink();
	const [faviconFound, setFaviconFound] = useState(true);
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		data: {
			categoryId,
		},
		disabled: disabledDragging,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.3 : 1,
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`relative justify-between text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20 ${
				editingMode ? 'cursor-move' : 'cursor-pointer'
			}`}
		>
			{editingMode ? (
				<>
					<LinkCardEditButton
						defaultTitle={title}
						defaultUrl={url}
						id={id}
					/>
					<div className='flex'>
						<div className='flex items-center justify-center mr-2'>
							{faviconFound ? (
								<Image
									height={15}
									width={15}
									src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
									alt='favicon'
									onError={() => setFaviconFound(false)}
								/>
							) : (
								<FaviconNotFound />
							)}
						</div>
						{title}
					</div>
					<Trash2Icon
						stroke='red'
						size={18}
						className='cursor-pointer'
						onClick={() => deleteLink(id)}
					/>
				</>
			) : (
				<a
					href={url}
					target='_blank'
					title={url}
					className='flex justify-center flex-1 cursor-pointer'
				>
					<div className='flex items-center justify-center mr-2'>
						{faviconFound ? (
							<Image
								height={15}
								width={15}
								src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
								alt='favicon'
								onError={() => setFaviconFound(false)}
							/>
						) : (
							<FaviconNotFound />
						)}
					</div>
					{title}
				</a>
			)}
		</div>
	);
}
