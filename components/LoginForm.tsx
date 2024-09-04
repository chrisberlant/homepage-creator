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
import { z } from 'zod';
import { useLogin } from '@/queries/auth.queries';

const credentialsSchema = z.strictObject({
	username: z.string({ required_error: 'Username is required' }).min(2, {
		message: 'Username must be at least 2 characters.',
	}),
	password: z.string({ required_error: 'Password is required' }).min(8, {
		message: 'Password must be at least 8 characters.',
	}),
});

export type credentialsType = z.infer<typeof credentialsSchema>;

export default function LoginForm() {
	const form = useForm<credentialsType>({
		resolver: zodResolver(credentialsSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	});
	const { mutate: login } = useLogin(form);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((e) => login(e))}
				className='mt-8 min-w-[300px]'
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
				<Button type='submit' className='mt-5 w-full'>
					Login
				</Button>
			</form>
		</Form>
	);
}
