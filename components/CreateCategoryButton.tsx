'use client';

import { PlusIcon } from 'lucide-react';
import { createCategory } from '../server-actions/categories';
import { useRef, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const createCategoryFormSchema = z.object({
	title: z.string().min(2, {
		message: 'Category must be at least 2 character.',
	}),
});

type createCategoryFormType = z.infer<typeof createCategoryFormSchema>;

export default function CreateCategoryButton() {
	const { register, handleSubmit, setError } =
		useForm<createCategoryFormType>({
			resolver: zodResolver(createCategoryFormSchema),
			defaultValues: {
				title: '',
			},
		});
	const [openedMenu, setOpenedMenu] = useState(false);

	return (
		<>
			<PlusIcon
				onClick={() => setOpenedMenu((prev) => !prev)}
				className='mb-4'
			/>
			{openedMenu && (
				<form
					onSubmit={handleSubmit(async (e) => {
						const creation = await createCategory(e.title);
						console.log(creation);
						if (creation?.error) {
							setError('title', {
								message: creation.error,
							});
						}
					})}
					className='flex'
				>
					<Input
						{...register('title')}
						placeholder='Category name'
						className='w-56 mr-4'
					></Input>
					<Button type='submit' className=''>
						Create
					</Button>
				</form>
			)}
		</>
	);
}
