import type { RowPropsType } from 'pragmatic-drag-and-drop-tree';
import type { DataType, IdType } from '../../data/sample';
import styles from './SampleRow.module.css';

const SampleRow = <ID extends IdType, D extends DataType>({
	'aria-controls': ariaControls,
	'aria-expanded': ariaExpanded,
	draggedItem,
	dragHandleRef,
	indentLevel,
	indentSize,
	indicatorType,
	instruction,
	item,
	itemRef,
	onExpandToggle,
	state,
	withDragHandle = false,
}: Omit<RowPropsType<ID, D>, 'item'> & {
	item?: RowPropsType<ID, D>['item'] | null;
	withDragHandle?: boolean;
}) => {
	const handleExpandToggleClick = (event: React.MouseEvent) => {
		if (!item) return;
		onExpandToggle?.({ event, isOpen: !item.isOpen, item });
	};

	// Don't render the dragged item when using ghost indicators
	const isHidden = draggedItem?.id === item?.id && indicatorType === 'ghost';

	return (
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: Deliberate
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
			{withDragHandle ? (
				<span
					className={styles.dragHandle}
					ref={dragHandleRef as React.RefObject<HTMLDivElement>}
				>
					<svg height='10' role='presentation' viewBox='0 0 6 10' width='6'>
						<title>Drag Handle</title>
						<g fill='currentcolor'>
							<circle cx='1' cy='1' r='1' />
							<circle cx='5' cy='1' r='1' />
							<circle cx='1' cy='5' r='1' />
							<circle cx='5' cy='5' r='1' />
							<circle cx='1' cy='9' r='1' />
							<circle cx='5' cy='9' r='1' />
						</g>
					</svg>
				</span>
			) : null}
			<div className={styles.content}>
				{item?.isExpandable ? (
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
				{item?.data?.name}
			</div>
		</li>
	);
};

export default SampleRow;
