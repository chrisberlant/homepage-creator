import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { UserType } from '@/lib/types';
import { updatePassword, updateUser } from '@/server-actions/user.actions';
import { UseFormReturn } from 'react-hook-form';

// Update the currentuser
export const useUpdateUser = () =>
	useMutation({
		mutationFn: updateUser,
		onMutate: async (updatedUser) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['user'],
			});
			const currentUser: UserType | undefined =
				browserQueryClient?.getQueryData(['user']);
			if (!currentUser || !browserQueryClient) return;
			if (
				currentUser.email === updatedUser.email &&
				currentUser.username === updatedUser.username
			)
				throw new Error('No data modified');

			browserQueryClient.setQueryData(['user'], (user: UserType) => ({
				...user,
				...updatedUser,
			}));

			return currentUser;
		},
		onSuccess: () => toast.success('User successfully updated'),
		onError: (error, _, currentUser) => {
			if (error.message === 'No data modified')
				return toast.info(error.message);
			toast.error(error.message);
			browserQueryClient?.setQueryData(['user'], currentUser);
		},
	});

// Update the password of the current user
export const useUpdatePassword = (
	form: UseFormReturn<
		{
			password: string;
			newPassword: string;
			confirmPassword: string;
		},
		any,
		undefined
	>
) =>
	useMutation({
		mutationFn: updatePassword,
		onMutate: async () => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['user'],
			});
		},
		onSuccess: () => {
			toast.success('Password successfully updated');
			form.reset();
		},
		onError: (error, _, previousUser) => {
			if (error.message === 'No data modified')
				return toast.info(error.message);
			toast.error(error.message);
			browserQueryClient?.setQueryData(['user'], previousUser);
		},
	});
