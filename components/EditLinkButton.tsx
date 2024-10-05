'use client';

import { PenIcon } from 'lucide-react';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
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
import { useContext, useEffect, useState } from 'react';
import { useUpdateLink } from '@/queries/links.queries';
import Image from 'next/image';
import { UpdateLinkType } from '@/lib/types';
import FaviconNotFound from './FaviconNotFound';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import { Button } from './ui/button';
import { updateLinkSchema, urlSchema } from '@/schemas/links.schemas';

interface EditLinkButtonProps {
	defaultTitle: string;
	defaultUrl: string;
	id: number;
}

export default function EditLinkButton({
	defaultTitle,
	defaultUrl,
	id,
}: EditLinkButtonProps) {
	const form = useForm<UpdateLinkType>({
		resolver: zodResolver(updateLinkSchema),
		defaultValues: {
			id,
			title: defaultTitle,
			url: defaultUrl,
		},
	});
	const url = form.getValues('url');

	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const [faviconFound, setFaviconFound] = useState(true);
	const [open, setOpen] = useState(false);
	const { mutate: updateLink } = useUpdateLink({
		form,
		setOpen,
		setDisabledDragging,
	});

	// Reset the form and allow dragging again when the dialog is closed
	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					className='absolute bottom-0 left-3 px-2'
					onClick={() => setDisabledDragging(true)}
				>
					<PenIcon size={18} />
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogDescription></DialogDescription>
					<DialogTitle>Edit a link</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((data) => updateLink(data))}
					>
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
						<FormField
							control={form.control}
							name='url'
							render={({ field }) => (
								<FormItem className='mt-2'>
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
							<Button type='submit'>Save changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
