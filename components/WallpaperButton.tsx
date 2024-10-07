'use client';

import { FileIcon, WallpaperIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { DisabledDraggingContext } from './providers/DisabledDraggingContextProvider';
import { Button } from './ui/button';
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
import { useForm } from 'react-hook-form';
import { urlObjectSchema } from '@/schemas/links.schemas';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from './ui/form';
import { UrlObjectType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';

export default function WallpaperButton() {
	const { setDisabledDragging } = useContext(DisabledDraggingContext);
	const form = useForm<UrlObjectType>({
		resolver: zodResolver(urlObjectSchema),
		defaultValues: {
			url: '',
		},
	});
	const [open, setOpen] = useState(false);

	// Reset the form and allow dragging again when the dialog is closed
	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button onClick={() => setDisabledDragging(true)}>
					<WallpaperIcon className='mr-2' />
					Set Wallpaper
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogDescription></DialogDescription>
					<DialogTitle>Edit a link</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((data) => {
							console.log(data.url);
							localStorage.setItem('wallpaper', data.url);
							setOpen(false);
						})}
					>
						{/* <div className='flex items-center gap-2'>
							<FileIcon className='mr-2' />
							<Input
								type='file'
								className='text-primary'
								accept='image/png, image/jpeg'
								// onChange={(e) => {
								// 	const file = e.target.files?.[0];
								// 	if (file) {
								// 		const fileUrl =
								// 			URL.createObjectURL(file);
								// 		form.setValue('url', fileUrl);
								// 		localStorage.setItem(
								// 			'wallpaperUrl',
								// 			fileUrl
								// 		);
								// 	}
								// }}
							/>
						</div> */}
						<FormField
							control={form.control}
							name='url'
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className='mt-4'>
							<DialogClose asChild>
								<Button type='reset' variant='outline'>
									Cancel
								</Button>
							</DialogClose>
							<Button
								variant='destructive'
								type='button'
								onClick={() =>
									localStorage.removeItem('wallpaper')
								}
							>
								Remove wallpaper
							</Button>
							<Button type='submit'>
								Set selected wallpaper
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
