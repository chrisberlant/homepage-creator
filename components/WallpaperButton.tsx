'use client';

import { WallpaperIcon } from 'lucide-react';
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
import {
	removeWallpaper,
	setWallpaper,
	setWallpaperToLocalStorage,
} from '@/utils/wallpaper';

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

	useEffect(() => {
		const storedWallpaper = localStorage.getItem('wallpaper');
		if (storedWallpaper) setWallpaper(storedWallpaper);
	}, []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button onClick={() => setDisabledDragging(true)}>
					<WallpaperIcon className='mr-2' />
					Set Wallpaper
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogDescription></DialogDescription>
					<DialogTitle>Set a wallpaper</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(({ url }) => {
							setWallpaperToLocalStorage(url);
							setOpen(false);
						})}
					>
						<FormField
							control={form.control}
							name='url'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Enter an URL</FormLabel>
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
								onClick={() => {
									removeWallpaper();
									setOpen(false);
								}}
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
