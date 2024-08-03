'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginFormSchema, loginFormType } from '@/schemas/form';
import { login } from '../server-actions/auth';
import { toast } from 'sonner';

export default function LoginForm() {
	const form = useForm<loginFormType>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(async (e) => {
					const loginSuccess = await login(form.getValues());
					// if (loginSuccess?.error) {
					// 	form.setError('username', {
					// 		message: 'Wrong id or password',
					// 	});
					// 	form.setError('password', {
					// 		message: 'Wrong id or password',
					// 	});
					// }
				})}
				className='mt-8 flex-1 max-w-md'
			>
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
					name='password'
					render={({ field }) => (
						<FormItem className='mt-2'>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type='password' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' className='mt-3 w-full'>
					Login
				</Button>
			</form>
		</Form>
	);
}
