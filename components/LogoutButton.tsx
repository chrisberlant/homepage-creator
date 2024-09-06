'use client';

import { useLogout } from '@/queries/auth.queries';
import { Button } from './ui/button';

export default function LogoutButton() {
	const { mutate: logout } = useLogout();

	return (
		<Button variant='destructive' onClick={() => logout()} className='mr-6'>
			Logout
		</Button>
	);
}
