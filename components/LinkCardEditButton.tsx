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
import { PenIcon } from 'lucide-react';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from './ui/form';
import { useState } from 'react';
import { updateLink } from '../server-actions/links';
import { toast } from 'sonner';
import { useUpdateLink } from '../queries/links';

const updateLinkSchema = z.object({
	title: z.string().min(2, {
		message: 'Title must be at least 2 characters.',
	}),
	url: z
		.string()
		.min(1, {
			message: 'URL cannot be empty',
		})
		.url({ message: 'Please enter a valid URL.' }),
});

export type updateLinkType = z.infer<typeof updateLinkSchema>;

interface LinkCardEditButtonProps {
	disableDragging: React.Dispatch<React.SetStateAction<boolean>>;
	defaultTitle: string;
	defaultUrl: string;
	id: number;
}

export default function LinkCardEditButton({
	disableDragging,
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
	const [open, setOpen] = useState(false);
	const { mutate } = useUpdateLink();

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger>
				<PenIcon
					className='cursor-pointer'
					size={18}
					onClick={() => disableDragging(true)}
				/>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(
							async (data) => {
								const { title, url } = data;
								const request = mutate({
									id,
									title,
									url,
								});
								// if (request?.error) toast.error(request.error);
								setOpen(false);
								disableDragging(false);
							},
							// If any error in the data
							() => setOpen(true)
						)}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Editing a link</AlertDialogTitle>
							<AlertDialogDescription>
								Update the title and URL
							</AlertDialogDescription>
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
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</AlertDialogHeader>
						<AlertDialogFooter className='mt-4'>
							<AlertDialogCancel
								type='reset'
								onClick={() => {
									form.reset();
									disableDragging(false);
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
