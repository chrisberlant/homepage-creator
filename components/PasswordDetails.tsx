'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { UserIcon } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updatePasswordSchema } from '@/schemas/auth.schemas.ts';
import { useUpdatePassword } from '@/queries/user.queries';
import { Button } from './ui/button';
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export default function PasswordDetails({
	setOpenAccountModal,
	openPasswordModal,
	setOpenPasswordModal,
}: {
	setOpenAccountModal: Dispatch<SetStateAction<boolean>>;
	openPasswordModal: boolean;
	setOpenPasswordModal: Dispatch<SetStateAction<boolean>>;
}) {
	const form = useForm({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
			newPassword: '',
		},
	});
	const { mutate: updatePassword } = useUpdatePassword(form);

	return (
		<AlertDialog
			open={openPasswordModal}
			onOpenChange={setOpenPasswordModal}
		>
			<AlertDialogContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(
							(data) => updatePassword(data),
							// If any error in the data
							() => setOpenPasswordModal(true)
						)}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>Password change</AlertDialogTitle>
							<AlertDialogDescription></AlertDialogDescription>
						</AlertDialogHeader>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current password</FormLabel>
									<FormControl>
										<Input type='password' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='newPassword'
							render={({ field }) => (
								<FormItem className='mt-2'>
									<FormLabel>New password</FormLabel>
									<FormControl>
										<Input type='password' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='confirmPassword'
							render={({ field }) => (
								<FormItem className='mt-2'>
									<FormLabel>Confirm new password</FormLabel>
									<FormControl>
										<Input type='password' {...field} />
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
										toast.warning('Changes were not saved');
									form.reset();
								}}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogTrigger
								className='mr-auto'
								type='reset'
								onClick={() => {
									setOpenAccountModal(true);
									setOpenPasswordModal(false);
									form.reset();
								}}
								asChild
							>
								<Button variant='ghost'>
									<UserIcon className='mr-2 h-4 w-4' />
									Go back to Account details
								</Button>
							</AlertDialogTrigger>
							<AlertDialogAction type='submit'>
								Update password
							</AlertDialogAction>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
