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
import { useContext, useState } from 'react';
import { useUpdateLink } from '@/queries/links.queries';
import Image from 'next/image';
import { updateLinkType } from '@/lib/types';
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
	const form = useForm<updateLinkType>({
		resolver: zodResolver(updateLinkSchema),
		defaultValues: {
			id,
			title: defaultTitle,
			url: defaultUrl,
		},
	});

	const { mutate: updateLink } = useUpdateLink();
	const url = form.getValues('url');
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const [faviconFound, setFaviconFound] = useState(true);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant='ghost'
					className='px-2 absolute bottom-0 left-3'
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
