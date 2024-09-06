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

export default function LinkCard({
	id,
	title,
	url,
	categoryId,
	disabledDragging,
	setDisabledDragging,
}: LinkWithCategoryType & {
	disabledDragging: boolean;
	setDisabledDragging: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const { editingMode } = useContext(EditingModeContext);
	const { mutate: deleteLink } = useDeleteLink();
	const [imgSrc, setImgSrc] = useState(
		`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`
	);

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
	if (id === 10) console.log(disabledDragging);

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
						setDisabledDragging={setDisabledDragging}
						defaultTitle={title}
						defaultUrl={url}
						id={id}
					/>
					<div className='flex'>
						<div className='flex items-center justify-center mr-2'>
							<Image
								height={15}
								width={15}
								src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
								alt='favicon'
								onError={() =>
									setImgSrc('/image-not-found.svg')
								}
							/>
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
					className='flex-1 cursor-pointer'
				>
					{title}
				</a>
			)}
		</div>
	);
}
