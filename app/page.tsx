import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getSession } from '@/server-actions/auth';

export default async function Home() {
	const session = await getSession();
	if (session) redirect('/home');

	return (
		<div className='flex justify-center'>
			<LoginForm />
		</div>
	);
}
