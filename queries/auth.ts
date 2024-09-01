import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { browserQueryClient } from '@/components/providers/QueryClientProvider';
import { getAuth, login, logout } from '@/server-actions/auth';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
	const { push } = useRouter();
	return useMutation({
		mutationFn: login,
		onMutate: async () =>
			await browserQueryClient?.cancelQueries({
				queryKey: ['user'],
			}),
		onSuccess: (apiResponse) => {
			browserQueryClient?.setQueryData(['user'], apiResponse);
			push('/home');
		},
		onError: (error) => toast.error(error.message),
	});
};

export const useGetUser = () =>
	useQuery({
		queryKey: ['user'],
		queryFn: async () => getAuth(),
	});

export const useLogout = () => {
	const { push } = useRouter();
	return useMutation({
		mutationFn: logout,
		onMutate: async () =>
			await browserQueryClient?.cancelQueries({
				queryKey: ['user', 'categories'],
			}),
		onSuccess: () => {
			browserQueryClient?.clear();
			push('/');
		},
		onError: (error) => toast.error(error.message),
	});
};
