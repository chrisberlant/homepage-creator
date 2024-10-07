'use client';

import React, { useContext } from 'react';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditLinkButton from './EditLinkButton';
import { LinkWithCategoryType } from '@/lib/types';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import Favicon from './Favicon';
import DeleteLinkButton from './DeleteLinkButton';

export default function LinkCard({
	id,
	title,
	url,
	categoryId,
}: LinkWithCategoryType) {
	const { editingMode } = useContext(EditingModeContext);
	const { disabledDragging } = useContext(DisabledDraggingContext);
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

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`relative z-20 flex justify-between rounded-xl border bg-muted p-2 text-center shadow-sm dark:shadow-none ${
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
						<Favicon url={url} />
						{title}
					</div>
					<DeleteLinkButton id={id} title={title} />
				</>
			) : (
				<a
					href={url}
					target='_blank'
					title={url}
					className='flex flex-1 cursor-pointer items-center justify-center'
				>
					<Favicon url={url} />
					{title}
				</a>
			)}
		</div>
	);
}
