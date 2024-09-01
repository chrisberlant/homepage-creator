'use client';

import { useGetUser, useLogout } from '@/queries/auth';
import { Button } from './ui/button';

export default function LogoutButton() {
	const { data: user } = useGetUser();
	const { mutate: logout } = useLogout();

	return (
		<div className=''>
			<span className='mr-4'>{user?.name}</span>
			<Button onClick={() => logout()} className='mr-8'>
				Logout
			</Button>
		</div>
	);
}
