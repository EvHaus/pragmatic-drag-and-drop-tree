import type { ChildrenPropsType, DataType } from '../types';

const toggleButtonStyle = {
	alignItems: 'center',
	display: 'inline-flex',
	height: 16,
	justifyContent: 'center',
	padding: 0,
	width: 16,
};

const DefaultChildren = <D extends DataType>({
	item,
	onExpandToggle,
	...other
}: ChildrenPropsType<D>) => {
	const handleExpandToggleClick = (event: React.MouseEvent) => {
		onExpandToggle?.({ event, item, isOpen: !item.isOpen });
	};

	return (
		<div>
			{onExpandToggle && item.items?.length ? (
				<button
					onClick={handleExpandToggleClick}
					style={toggleButtonStyle}
					type='button'
				>
					{item.isOpen ? '^' : '>'}
				</button>
			) : (
				<div style={toggleButtonStyle} />
			)}
			{item.id}
		</div>
	);
};

export default DefaultChildren;
