import type {
	DataType,
	IndicatorPropsType,
} from 'pragmatic-drag-and-drop-tree';
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
