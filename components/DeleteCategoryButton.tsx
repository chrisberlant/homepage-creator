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
import { useDeleteCategory } from '@/queries/categories.queries';
import { Button } from './ui/button';

interface DeleteCategoryButtonProps {
	id: number;
	title: string;
}

export default function DeleteCategoryButton({
	id,
	title,
}: DeleteCategoryButtonProps) {
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const [open, setOpen] = useState(false);
	const { mutate: deleteCategory } = useDeleteCategory({
		setDisabledDragging,
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant='ghost'
					className='mb-2 px-2 py-1'
					onClick={() => setDisabledDragging(true)}
				>
					<Trash2Icon stroke='red' />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Confirm the category delete
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete the category {title}. This
						action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={() => setDisabledDragging(false)}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => deleteCategory(id)}>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
