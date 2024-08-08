'use client';

import { PlusIcon } from 'lucide-react';
import { createLink } from '../server-actions/links';
import { useState } from 'react';
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
import { Button } from './ui/button';

const createLinkFormSchema = z.object({
	title: z.string().min(1, {
		message: 'Link title must be at least 1 character.',
	}),
	url: z.string().min(1, {
		message: 'URL must be at least 1 character.',
	}),
});

type createLinkFormType = z.infer<typeof createLinkFormSchema>;

export default function CreateLinkButton({
	categoryId,
}: {
	categoryId: number;
}) {
	const form = useForm<createLinkFormType>({
		resolver: zodResolver(createLinkFormSchema),
		defaultValues: {
			title: '',
			url: '',
		},
	});
	const [openedMenu, setOpenedMenu] = useState(false);

	return (
		<>
			<PlusIcon
				onClick={() => setOpenedMenu((prev) => !prev)}
				className='mb-2'
			/>
			{openedMenu && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (e) => {
							const { title, url } = e;
							const creation = await createLink({
								title,
								url,
								categoryId,
								index: 0,
							});
							if (creation?.error) {
								return form.setError('title', {
									message: creation.error,
								});
							}
							form.reset();
						})}
						className='flex flex-col mb-4'
					>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Create new Link</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='url'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Insert URL</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type='submit' className='mt-2'>
							Create link
						</Button>
					</form>
				</Form>
			)}
		</>
	);
}
