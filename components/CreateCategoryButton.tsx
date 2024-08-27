'use client';

import { MinusIcon, PlusIcon } from 'lucide-react';
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
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { Button } from './ui/button';
import { useCreateCategory } from '@/queries/categories';

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
	const [openedMenu, setOpenedMenu] = useState(false);

	return (
		editingMode && (
			<div className='flex gap-4 items-center'>
				{openedMenu ? (
					<Button
						className='bg-accent'
						onClick={() => setOpenedMenu(!openedMenu)}
					>
						Close menu
					</Button>
				) : (
					<Button onClick={() => setOpenedMenu(!openedMenu)}>
						Create a new category
					</Button>
				)}
				{openedMenu && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((e) =>
								createCategory(e.title)
							)}
							className='flex mb-4'
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
							<Button type='submit' className='self-end ml-2'>
								Valider
							</Button>
						</form>
					</Form>
				)}
			</div>
		)
	);
}
