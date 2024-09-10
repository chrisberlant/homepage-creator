'use client';

import { CheckIcon, CircleXIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Form, FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CreateCategoryType } from '@/lib/types';
import { createCategorySchema } from '@/schemas/index.schemas';
import { useUpdateCategory } from '../queries/categories.queries';
import { Input } from './ui/input';
import { useContext, useEffect, useRef } from 'react';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';

export default function EditCategoryTitleForm({
	id,
	defaultTitle,
	setEditingTitle,
}: {
	id: number;
	defaultTitle: string;
	setEditingTitle: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const form = useForm<CreateCategoryType>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			title: defaultTitle,
		},
	});
	const inputRef = useRef<HTMLInputElement>(null);

	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const { mutate: updateCategory } = useUpdateCategory({
		setEditingTitle,
		setDisabledDragging,
	});

	useEffect(() => {
		if (inputRef.current) inputRef.current.focus();
	}, []);

	return (
		<Form {...form}>
			<form
				className='flex w-36 h-6 gap-2'
				onSubmit={form.handleSubmit((data) =>
					updateCategory({
						id,
						title: data.title,
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
					type='submit'
					variant='ghost'
					size='icon'
					className='h-8 px-1'
				>
					<CheckIcon className='h-4 w-4' />
				</Button>
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
					<CircleXIcon className='h-4 w-4' />
				</Button>
			</form>
		</Form>
	);
}
