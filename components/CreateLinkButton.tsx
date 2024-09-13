'use client';

import { XIcon, BookmarkPlusIcon } from 'lucide-react';
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
import { createLinkSchema, urlSchema } from '@/schemas/links.schemas';
import { CreateLinkType } from '@/lib/types';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';

export default function CreateLinkButton({
	categoryId,
}: {
	categoryId: number;
}) {
	const form = useForm<CreateLinkType>({
		resolver: zodResolver(createLinkSchema),
		defaultValues: {
			categoryId,
			title: '',
			url: '',
		},
	});
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const url = form.getValues('url');
	const [openedMenu, setOpenedMenu] = useState(false);
	const [faviconFound, setFaviconFound] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);

	const { mutate: createLink } = useCreateLink({
		form,
		setOpenedMenu,
		setDisabledDragging,
	});

	useEffect(() => {
		if (inputRef.current && openedMenu) inputRef.current.focus();
	}, [openedMenu]);

	return (
		<>
			<Button
				variant='ghost'
				className='mb-2 py-1 px-2'
				onClick={() => {
					setOpenedMenu(true);
					setDisabledDragging(true);
					form.reset();
				}}
			>
				<BookmarkPlusIcon />
			</Button>

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
						className='flex cursor-default flex-col mb-4 border p-4 bg-card rounded-xl absolute z-30 w-96'
					>
						<Button
							variant='ghost'
							className='absolute right-0 top-0 p-1'
							onClick={() => {
								setOpenedMenu(false);
								setDisabledDragging(false);
							}}
						>
							<XIcon />
						</Button>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem className='mb-2'>
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
								<FormItem className='mb-2'>
									<FormLabel>Insert URL</FormLabel>
									<FormControl>
										<div className='flex relative'>
											<div className='flex items-center justify-center absolute bottom-2.5 left-3'>
												{urlSchema.safeParse(url)
													.success && faviconFound ? (
													<Image
														height={20}
														width={20}
														src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
														alt='favicon'
														onError={() =>
															setFaviconFound(
																false
															)
														}
													/>
												) : (
													<FaviconNotFound className='h-6 w-6' />
												)}
											</div>
											<Input
												className='pl-11'
												{...field}
											/>
										</div>
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
