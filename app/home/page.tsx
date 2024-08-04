import { getSession } from '@/server-actions/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
	const session = await getSession();
	if (!session) redirect('/');

	return <div>Accueil</div>;
}
