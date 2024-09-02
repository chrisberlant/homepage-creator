'use client';

import { useGetUser, useLogout } from '@/queries/auth';
import { Button } from './ui/button';

export default function LogoutButton() {
	const { data: user } = useGetUser();
	const { mutate: logout } = useLogout();

	return (
		<div className='mr-12'>
			<span className='mr-4'>{user?.username}</span>
			<Button
				variant='destructive'
				onClick={() => logout()}
				className='mr-8'
			>
				Logout
			</Button>
		</div>
	);
}
