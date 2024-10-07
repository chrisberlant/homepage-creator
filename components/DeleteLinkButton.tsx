'use client';

import { Trash2Icon } from 'lucide-react';
import { useContext, useState } from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import { useDeleteLink } from '@/queries/links.queries';
import { Button } from './ui/button';

interface DeleteLinkButtonProps {
	id: number;
	title: string;
}

export default function DeleteLinkButton({ id, title }: DeleteLinkButtonProps) {
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const [open, setOpen] = useState(false);
	const { mutate: deleteLink } = useDeleteLink({ setDisabledDragging });

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant='ghost'
					className='absolute -top-1.5 right-1.5 p-0'
					onClick={() => setDisabledDragging(true)}
				>
					<Trash2Icon stroke='red' size={18} />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Confirm the link delete</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the link {title}. This
						action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={() => setDisabledDragging(false)}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => deleteLink(id)}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
