import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { UserType } from '@/lib/types';
import { updateUser } from '@/server-actions/user.actions';

// Update the user
export const useUpdateUser = () =>
	useMutation({
		mutationFn: updateUser,
		onMutate: async (updatedUser) => {
			await browserQueryClient?.cancelQueries({
				queryKey: ['user'],
			});

			const previousUser: UserType | undefined =
				browserQueryClient?.getQueryData(['user']);
			if (!previousUser || !browserQueryClient) return;

			browserQueryClient.setQueryData(['user'], (user: UserType) => ({
				...user,
				...updatedUser,
			}));

			return previousUser;
		},
		onSuccess: () => toast.success('User successfully updated'),
		onError: (error, __, previousUser) => {
			toast.error(error.message);
			browserQueryClient?.setQueryData(['user'], previousUser);
		},
	});
