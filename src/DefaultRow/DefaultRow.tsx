import DefaultDropIndicator from '../DefaultDropIndicator/DefaultDropIndicator';
import type { DataType, RowPropsType } from '../types';
import styles from './DefaultRow.module.css';

const DefaultRow = <D extends DataType>({
	'aria-controls': ariaControls,
	'aria-expanded': ariaExpanded,
	indentLevel,
	indentSize,
	instruction,
	item,
	itemRef,
	onExpandToggle,
	state,
}: RowPropsType<D>) => {
	const handleExpandToggleClick = (event: React.MouseEvent) => {
		onExpandToggle?.({ event, item, isOpen: !item.isOpen });
	};

	return (
		<li
			aria-controls={ariaControls}
			aria-expanded={ariaExpanded}
			className={[
				styles.main,
				state === 'idle' ? styles.idle : null,
				state === 'dragging' ? styles.dragging : null,
				state === 'parent-of-instruction' ? styles.parentOfInstruction : null,
			]
				.filter(Boolean)
				.join(' ')}
			ref={itemRef as React.RefObject<HTMLLIElement>}
			style={
				{
					'--indent-level': `${indentLevel * indentSize}px`,
				} as React.CSSProperties
			}
		>
			{onExpandToggle && item.items?.length ? (
				<button
					className={styles.toggleButton}
					onClick={handleExpandToggleClick}
					type='button'
				>
					{item.isOpen ? '▼' : '►'}
				</button>
			) : (
				<div className={styles.toggleButton} />
			)}
			{item.id}
			{instruction ? <DefaultDropIndicator instruction={instruction} /> : null}
		</li>
	);
};

export default DefaultRow;
