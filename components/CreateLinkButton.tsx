'use client';

import {
	PlusIcon,
	MinusIcon,
	XIcon,
	BookmarkIcon,
	BookmarkPlusIcon,
} from 'lucide-react';
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
import { Button } from './ui/button';
import { useCreateLink } from '@/queries/links.queries';
import { createLinkSchema } from '@/schemas/index.schemas';
import { CreateLinkType } from '@/lib/types';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';

export default function CreateLinkButton({
	categoryId,
}: {
	categoryId: number;
}) {
	const form = useForm<CreateLinkType>({
		resolver: zodResolver(createLinkSchema),
		defaultValues: {
			title: '',
			url: '',
		},
	});
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const [openedMenu, setOpenedMenu] = useState(false);
	const { mutate: createLink } = useCreateLink({
		form,
		setOpenedMenu,
		setDisabledDragging,
	});

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current && openedMenu) inputRef.current.focus();
	}, [openedMenu]);

	return (
		<>
			<BookmarkPlusIcon
				onClick={() => {
					setOpenedMenu(true);
					setDisabledDragging(true);
				}}
				className='mb-4 cursor-pointer'
			/>

			{openedMenu && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((e) => {
							const { title, url } = e;
							createLink({
								title,
								url,
								categoryId,
							});
						})}
						className='flex flex-col mb-4 border p-4 bg-card rounded-xl absolute z-50'
					>
						<XIcon
							className='cursor-pointer absolute right-2 top-2'
							onClick={() => {
								setOpenedMenu(false);
								setDisabledDragging(false);
							}}
						/>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Insert title</FormLabel>
									<FormControl>
										<Input {...field} ref={inputRef} />
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
