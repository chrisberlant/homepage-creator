import EditingModeContextProvider from '@/components/EditingModeContextProvider';
import DndContextProvider from '../../components/DndContextProvider';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <EditingModeContextProvider>{children}</EditingModeContextProvider>;
}
