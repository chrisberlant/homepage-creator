'use client';

import { PlusIcon, MinusIcon } from 'lucide-react';
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
import { useCreateLink } from '@/queries/links.queries';

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
	const { mutate: createLink } = useCreateLink({ form, setOpenedMenu });

	return (
		<>
			{openedMenu ? (
				<MinusIcon
					onClick={() => setOpenedMenu(!openedMenu)}
					className='mb-4'
				/>
			) : (
				<PlusIcon
					onClick={() => setOpenedMenu(!openedMenu)}
					className='mb-4'
				/>
			)}

			{openedMenu && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (e) => {
							const { title, url } = e;
							createLink({
								title,
								url,
								categoryId,
							});
						})}
						className='flex flex-col mb-4 border p-4 bg-card rounded-xl absolute z-50'
					>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Insert title</FormLabel>
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
						<Button type='submit' className='mt-4'>
							Create link
						</Button>
					</form>
				</Form>
			)}
		</>
	);
}
