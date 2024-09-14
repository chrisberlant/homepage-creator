'use client';

import { useContext, useState } from 'react';
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
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogHeader,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { CreateCategoryType } from '@/lib/types';
import { createCategorySchema } from '@/schemas/categories.schemas';

export default function CreateCategoryButton() {
	const { editingMode } = useContext(EditingModeContext);
	const form = useForm<CreateCategoryType>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			title: '',
		},
	});
	const { mutate: createCategory } = useCreateCategory(form);
	const [open, setOpen] = useState(false);

	return (
		editingMode && (
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogTrigger asChild>
					<Button>Create a new category</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(
								(data) => createCategory({ title: data.title }),
								() => setOpen(true)
							)}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Create a new category
								</AlertDialogTitle>
								<AlertDialogDescription></AlertDialogDescription>
							</AlertDialogHeader>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<AlertDialogFooter className='mt-4'>
								<AlertDialogCancel
									type='reset'
									onClick={() => form.reset()}
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction type='submit'>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</form>
					</Form>
				</AlertDialogContent>
			</AlertDialog>
		)
	);
}
