'use client';

import { logout } from '../server-actions/auth';
import { Button } from './ui/button';

export default function LogoutButton({ name }: { name: string }) {
	return (
		<div className=''>
			<span className='mr-4'>{name}</span>
			<Button onClick={() => logout()} className='mr-8'>
				Logout
			</Button>
		</div>
	);
}
