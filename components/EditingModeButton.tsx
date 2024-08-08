'use client';

import { useContext } from 'react';
import { Button } from './ui/button';
import { EditingContext } from '../app/home/layout';

export default function EditingModeButton() {
	const { editingMode, toggleEditingMode } = useContext(EditingContext);
	return (
		<Button onClick={toggleEditingMode} className='mt-4'>
			{editingMode ? 'Quit edit mode' : 'Enable edit mode'}
		</Button>
	);
}
