'use client';

import { BookmarkPlusIcon } from 'lucide-react';
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
	const [open, setOpen] = useState(false);
	const [faviconFound, setFaviconFound] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate: createLink } = useCreateLink({
		form,
		setOpen,
		setDisabledDragging,
	});

	useEffect(() => {
		if (inputRef.current) inputRef.current.focus();
	}, [open]);

	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setDisabledDragging(true)}
				>
					<BookmarkPlusIcon />
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogDescription></DialogDescription>
					<DialogTitle>Create a link</DialogTitle>
				</DialogHeader>
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
					>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem className='mb-2'>
									<FormLabel>Title</FormLabel>
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
									<FormLabel>URL</FormLabel>
									<FormControl>
										<div className='relative flex'>
											<div className='absolute bottom-2.5 left-3 flex items-center justify-center'>
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
													<FaviconNotFound className='size-6' />
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
						<DialogFooter className='mt-4'>
							<DialogClose asChild>
								<Button type='reset' variant='outline'>
									Close
								</Button>
							</DialogClose>
							<Button type='submit'>Create link</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
