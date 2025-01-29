import clsx from 'clsx';
import type { CSSProperties } from 'react';
import type { Instruction } from '../tree-item-hitbox';
import styles from './SortableTreeDropIndicator.module.css';

export type PropsType = {
	indent: number;
	instruction: Instruction;
};

const SortableTreeDropIndicator = ({ indent, instruction }: PropsType) => {
	const isBlocked = instruction.type === 'instruction-blocked';

	const style = {
		'--horizontal-indent':
			instruction.type === 'reparent'
				? `${instruction.desiredLevel * instruction.indentPerLevel}px`
				: `${indent}px`,
		'--indicator-color': !isBlocked ? 'blue' : 'red',
	} as CSSProperties;

	return (
		<div
			className={clsx(
				styles.main,
				instruction.type === 'make-child' ? styles.mainOutline : null,
				instruction.type === 'reorder-above' ? styles.mainAbove : null,
				instruction.type === 'reorder-below' ? styles.mainBelow : null,
			)}
			style={style}
		/>
	);
};

export default SortableTreeDropIndicator;
