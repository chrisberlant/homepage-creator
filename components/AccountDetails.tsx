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
import { KeyIcon } from 'lucide-react';

export default function AccountDetails() {
	const { data: user } = useGetUser();
	const form = useForm({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			username: user?.data?.username,
			email: user?.data?.email,
		},
	});
	const { mutate: updateUser } = useUpdateUser();
	const [open, setOpen] = useState(false);
	const [openPasswordModal, setOpenPasswordModal] = useState(false);

	return (
		user && (
			<>
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger asChild>
						<Button variant='ghost' className='mr-4'>
							{user.data?.username}
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
									<AlertDialogTrigger
										className='mr-auto'
										type='reset'
										onClick={() => {
											setOpen(false);
											setOpenPasswordModal(true);
											form.reset();
										}}
										asChild
									>
										<Button variant='ghost'>
											<KeyIcon className='mr-2 h-4 w-4' />
											Change password
										</Button>
									</AlertDialogTrigger>
									<AlertDialogAction type='submit'>
										Update infos
									</AlertDialogAction>
								</AlertDialogFooter>
							</form>
						</Form>
					</AlertDialogContent>
				</AlertDialog>

				<PasswordDetails
					openPasswordModal={openPasswordModal}
					setOpenPasswordModal={setOpenPasswordModal}
					setOpenAccountModal={setOpen}
				/>
			</>
		)
	);
}
