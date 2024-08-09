'use client';

import { PlusIcon } from 'lucide-react';
import { createCategory } from '../server-actions/categories';
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
import { EditingModeContext } from './EditingModeContextProvider';

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
	const [openedMenu, setOpenedMenu] = useState(false);

	return (
		editingMode && (
			<>
				<PlusIcon
					onClick={() => setOpenedMenu((prev) => !prev)}
					className='mb-4'
				/>
				{openedMenu && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(async (e) => {
								const creation = await createCategory(e.title);
								if (creation?.error) {
									return form.setError('title', {
										message: creation.error,
									});
								}
								form.reset();
							})}
							className='flex'
						>
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
						</form>
					</Form>
				)}
			</>
		)
	);
}
