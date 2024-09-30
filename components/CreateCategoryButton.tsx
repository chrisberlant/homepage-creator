'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { Button } from './ui/button';
import { useCreateCategory } from '@/queries/categories.queries';
import { CreateCategoryType } from '@/lib/types';
import { createCategorySchema } from '@/schemas/categories.schemas';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

export default function CreateCategoryButton({ column }: { column: number }) {
	const { editingMode } = useContext(EditingModeContext);
	const form = useForm<CreateCategoryType>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			column,
			title: '',
		},
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate: createCategory } = useCreateCategory(form);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (inputRef.current) inputRef.current.focus();
	}, []);

	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	return (
		editingMode && (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button className='mt-2 self-center'>
						Create a new category
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogDescription></DialogDescription>
						<DialogTitle>Create a new category</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(({ title, column }) =>
								createCategory({
									title,
									column,
								})
							)}
						>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} ref={inputRef} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className='mt-4'>
								<DialogClose asChild>
									<Button type='reset' variant='outline'>
										Close
									</Button>
								</DialogClose>
								<Button type='submit'>Save changes</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		)
	);
}
