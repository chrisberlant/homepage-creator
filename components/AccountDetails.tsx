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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from './ui/form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetUser } from '@/queries/auth.queries';
import { updateUserSchema } from '@/schemas/index.schemas';
import { useUpdateUser } from '@/queries/user.queries';

export default function AccountDetails() {
	const { data: user } = useGetUser();
	const { mutate: updateUser } = useUpdateUser();
	const form = useForm({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			username: user?.username,
			email: user?.email,
		},
	});
	const [open, setOpen] = useState(false);

	return (
		user && (
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogTrigger asChild>
					<Button variant='ghost' className='mr-4'>
						{user?.username}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(
								(data) => updateUser(data),
								// If any error in the data
								() => setOpen(true)
							)}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Editing your account
								</AlertDialogTitle>
								<AlertDialogDescription></AlertDialogDescription>
							</AlertDialogHeader>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem className='mt-2'>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<AlertDialogFooter className='mt-4'>
								<AlertDialogCancel
									type='reset'
									onClick={() => form.reset()}
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
		)
	);
}
