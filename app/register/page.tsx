import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';
import { buttonVariants } from '../../components/ui/button';

export default function Register() {
	return (
		<div className='flex flex-col items-center'>
			<RegisterForm />
			<Link
				className={`${buttonVariants({ variant: 'outline' })} mt-8`}
				href='/'
			>
				Already have an account? Login here
			</Link>
		</div>
	);
}
