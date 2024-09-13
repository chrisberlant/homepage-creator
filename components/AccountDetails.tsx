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
import { updateUserSchema } from '@/schemas/auth.schemas.ts';
import { useUpdateUser } from '@/queries/user.queries';
import { toast } from 'sonner';
import PasswordDetails from './PasswordDetails';

export default function AccountDetails() {
	const { data: user } = useGetUser();
	const form = useForm({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			username: user?.username,
			email: user?.email,
		},
	});
	const { mutate: updateUser } = useUpdateUser();
	const [open, setOpen] = useState(false);

	return (
		user && (
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogTrigger asChild>
					<Button variant='ghost' className='mr-4'>
						{user.username}
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
									Account details
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
									className='mr-auto'
									onClick={() => {
										if (form.formState.isDirty)
											toast.warning(
												'Changes were not saved'
											);
										form.reset();
									}}
								>
									Cancel
								</AlertDialogCancel>
								<PasswordDetails
									setOpenAccountModal={setOpen}
								/>
								<AlertDialogAction type='submit'>
									Update infos
								</AlertDialogAction>
							</AlertDialogFooter>
						</form>
					</Form>
				</AlertDialogContent>
			</AlertDialog>
		)
	);
}
