'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GlobeIcon, PenIcon } from 'lucide-react';
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
import { useState } from 'react';
import { useUpdateLink } from '@/queries/links.queries';
import Image from 'next/image';
import { updateLinkType } from '../lib/types';
import { updateLinkSchema, urlSchema } from '../schemas/index.schemas';
import FaviconNotFound from './FaviconNotFound';

interface LinkCardEditButtonProps {
	setDisabledDragging: React.Dispatch<React.SetStateAction<boolean>>;
	defaultTitle: string;
	defaultUrl: string;
	id: number;
}

export default function LinkCardEditButton({
	setDisabledDragging,
	defaultTitle,
	defaultUrl,
	id,
}: LinkCardEditButtonProps) {
	const form = useForm<updateLinkType>({
		resolver: zodResolver(updateLinkSchema),
		defaultValues: {
			title: defaultTitle,
			url: defaultUrl,
		},
	});
	const { mutate: updateLink } = useUpdateLink();
	const [open, setOpen] = useState(false);
	const url = form.getValues('url');
	const [faviconFound, setFaviconFound] = useState(true);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger>
				<PenIcon
					className='cursor-pointer'
					size={18}
					onClick={() => setDisabledDragging(true)}
				/>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(
							(data) =>
								updateLink({
									id,
									title: data.title,
									url: data.url,
								}),
							// If any error in the data
							() => setOpen(true)
						)}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Editing a link</AlertDialogTitle>
							<AlertDialogDescription></AlertDialogDescription>
						</AlertDialogHeader>
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
												className='pl-10'
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<AlertDialogFooter className='mt-4'>
							<AlertDialogCancel
								type='reset'
								onClick={() => {
									form.reset();
									setDisabledDragging(false);
								}}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction type='submit'>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
