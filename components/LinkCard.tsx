'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditLinkButton from './EditLinkButton';
import { useDeleteLink } from '@/queries/links.queries';
import { LinkWithCategoryType } from '@/lib/types';
import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import { FaviconsContext } from './providers/FaviconsContextProvider';

export default function LinkCard({
	id,
	title,
	url,
	categoryId,
}: LinkWithCategoryType) {
	const { editingMode } = useContext(EditingModeContext);
	const { disabledDragging } = useContext(DisabledDraggingContext);
	const { mutate: deleteLink } = useDeleteLink();
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
			type: 'link',
		},
		disabled: disabledDragging,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.3 : 1,
		transition,
	};

	const favicons = useContext(FaviconsContext);
	const [faviconUrl, setFaviconUrl] = useState('');

	useEffect(() => {
		const favicon = favicons.find((f) => f.id === id);
		setFaviconUrl(favicon ? favicon.url : '');
	}, [favicons, id]);

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
					<EditLinkButton
						defaultTitle={title}
						defaultUrl={url}
						id={id}
					/>
					<div className='flex flex-1 items-center justify-center'>
						<div className='flex  mr-2'>
							{faviconUrl ? (
								<Image
									height={15}
									width={15}
									src={faviconUrl}
									alt='favicon'
								/>
							) : (
								<FaviconNotFound />
							)}
						</div>
						{title}
					</div>
					<button
						className='absolute right-1.5 top-1.5 p-0'
						onClick={() => deleteLink(id)}
					>
						<Trash2Icon stroke='red' size={18} />
					</button>
				</>
			) : (
				<a
					href={url}
					target='_blank'
					title={url}
					className='flex justify-center flex-1 cursor-pointer'
				>
					<div className='flex items-center justify-center mr-2'>
						{faviconUrl ? (
							<Image
								height={15}
								width={15}
								src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
								alt='favicon'
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
