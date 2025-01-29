import type { Instruction } from '../tree-item-hitbox';
import styles from './DefaultDropIndicator.module.css';

export type PropsType = {
	instruction: Instruction;
};

const DefaultDropIndicator = ({ instruction }: PropsType) => (
	<div
		className={[
			styles.main,
			instruction.type === 'make-child' ? styles.outline : null,
			instruction.type === 'reorder-above' ? styles.above : null,
			instruction.type === 'reorder-below' || instruction.type === 'reparent'
				? styles.below
				: null,
		]
			.filter(Boolean)
			.join(' ')}
	/>
);

export default DefaultDropIndicator;
