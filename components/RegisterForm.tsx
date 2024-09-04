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
import { useRegister } from '@/queries/auth.queries';

export const registerSchema = z
	.strictObject({
		username: z.string({ required_error: 'Username is required' }).min(2, {
			message: 'Username must be at least 2 characters.',
		}),
		email: z
			.string({ required_error: 'Username is required' })
			.email('Invalid email address'),
		password: z
			.string({ required_error: 'Password is required' })
			.min(8, {
				message: 'Password must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'Password must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
		confirmPassword: z
			.string()
			.min(8, {
				message: 'Password confirmation must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'Password confirmation must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Confirmation is different from the password',
		path: ['confirmPassword'],
	});

export type registerType = z.infer<typeof registerSchema>;

export default function RegisterForm() {
	const form = useForm<registerType>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});
	const { mutate: register } = useRegister();

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((e) => register(e))}
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
					name='email'
					render={({ field }) => (
						<FormItem className='mt-2'>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type='email' {...field} />
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
				<FormField
					control={form.control}
					name='confirmPassword'
					render={({ field }) => (
						<FormItem className='mt-2'>
							<FormLabel>Confirm password</FormLabel>
							<FormControl>
								<Input type='password' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' className='mt-5 w-full'>
					Register
				</Button>
			</form>
		</Form>
	);
}
