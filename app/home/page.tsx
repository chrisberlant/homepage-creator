import { getSession } from '../../lib/auth';

export default async function Page() {
	const session = await getSession();

	return <div>Accueil {session.value}</div>;
}
