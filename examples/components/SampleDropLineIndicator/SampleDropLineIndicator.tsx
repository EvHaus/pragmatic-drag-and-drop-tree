import type { IndicatorPropsType } from 'pragmatic-drag-and-drop-tree';
import type { DataType } from '../../data/sample';
import styles from './SampleDropLineIndicator.module.css';

const SampleDropLineIndicator = ({
	indentLevel,
	indentSize,
}: IndicatorPropsType<DataType>) => (
	<li
		className={styles.main}
		style={
			{
				'--indent-level': `${indentLevel * indentSize}px`,
			} as React.CSSProperties
		}
	/>
);

export default SampleDropLineIndicator;
