'use client';

import { useContext, useState } from 'react';
import { Input } from './ui/input';
import { z } from 'zod';
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
import { useCreateCategory } from '@/queries/categories';
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

const createCategoryFormSchema = z.object({
	title: z.string().min(1, {
		message: 'Title must be at least 1 character.',
	}),
});

type createCategoryFormType = z.infer<typeof createCategoryFormSchema>;

export default function CreateCategoryButton() {
	const { editingMode } = useContext(EditingModeContext);
	const form = useForm<createCategoryFormType>({
		resolver: zodResolver(createCategoryFormSchema),
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
								(data) => createCategory(data.title),
								() => setOpen(true)
							)}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Create a new category
								</AlertDialogTitle>
								<AlertDialogDescription>
									Enter the category name
								</AlertDialogDescription>
							</AlertDialogHeader>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Create new category
										</FormLabel>
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
