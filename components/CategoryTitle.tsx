'use client';

import { CheckIcon, CircleXIcon, FolderPenIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Form, FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { updateCategorySchema } from '@/schemas/categories.schemas';
import { useUpdateCategory } from '@/queries/categories.queries';
import { Input } from './ui/input';
import { useContext, useEffect, useRef, useState } from 'react';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import { UpdateCategoryType } from '@/lib/types';
import { EditingModeContext } from './providers/EditingModeContextProvider';

export default function CategoryTitle({
	id,
	defaultTitle,
}: {
	id: number;
	defaultTitle: string;
}) {
	const form = useForm<UpdateCategoryType>({
		resolver: zodResolver(updateCategorySchema),
		defaultValues: {
			id,
			title: defaultTitle,
		},
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const [editingTitle, setEditingTitle] = useState(false);
	const { editingMode } = useContext(EditingModeContext);
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const { mutate: updateCategory } = useUpdateCategory({
		setEditingTitle,
		setDisabledDragging,
	});

	useEffect(() => {
		if (inputRef.current) inputRef.current.focus();
	}, []);

	return (
		<>
			{!editingTitle ? (
				<>
					{editingMode && (
						<Button
							variant='ghost'
							className='mr-2 py-1 px-2'
							onClick={() => {
								setEditingTitle(!editingTitle);
								setDisabledDragging(true);
							}}
						>
							<FolderPenIcon className='size-4' />{' '}
						</Button>
					)}
					<h2 className='font-bold'>{defaultTitle}</h2>
				</>
			) : (
				<Form {...form}>
					<form
						className='flex w-36 h-6 gap-2'
						onSubmit={form.handleSubmit(({ title }) =>
							updateCategory({
								id,
								title,
							})
						)}
					>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											className='h-8 w-32'
											ref={inputRef}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type='reset'
							variant='ghost'
							size='icon'
							className='h-8 px-1'
							onClick={() => {
								setEditingTitle(false);
								setDisabledDragging(false);
							}}
						>
							<CircleXIcon color='red' className='h-4 w-4' />
						</Button>
						<Button
							type='submit'
							variant='ghost'
							size='icon'
							className='h-8 px-1'
						>
							<CheckIcon className='h-4 w-4' />
						</Button>
					</form>
				</Form>
			)}
		</>
	);
}
