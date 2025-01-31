import type { DataType, RowPropsType } from '../types';
import styles from './SampleRow.module.css';

const SampleRow = <D extends DataType>({
	'aria-controls': ariaControls,
	'aria-expanded': ariaExpanded,
	draggedItem,
	indentLevel,
	indentSize,
	indicatorType,
	instruction,
	item,
	itemRef,
	onExpandToggle,
	state,
}: RowPropsType<D>) => {
	const handleExpandToggleClick = (event: React.MouseEvent) => {
		onExpandToggle?.({ event, item, isOpen: !item.isOpen });
	};

	// Don't render the dragged item when using ghost indicators
	const isHidden = draggedItem?.id === item.id && indicatorType === 'ghost';

	return (
		<li
			aria-controls={ariaControls}
			aria-expanded={ariaExpanded}
			className={[
				styles.main,
				state === 'idle' ? styles.idle : null,
				state === 'dragging' ? styles.dragging : null,
				state === 'parent-of-instruction' ? styles.parentOfInstruction : null,
				state === 'indicator' ? styles.indicator : null,
				instruction?.type === 'make-child' ? styles.outline : null,
				isHidden ? styles.hidden : null,
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
		</li>
	);
};

export default SampleRow;
