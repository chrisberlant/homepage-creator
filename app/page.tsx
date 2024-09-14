import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { getSession } from '../lib/jwt';

export default async function Login() {
	const session = await getSession();
	if (session) redirect('/home');

	return (
		<div className='flex flex-col items-center'>
			<LoginForm />
			<Link
				className={`${buttonVariants({ variant: 'outline' })} mt-8`}
				href='/register'
			>
				Don&apos;t have an account? Register here
			</Link>
		</div>
	);
}
