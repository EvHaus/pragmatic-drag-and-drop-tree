import type {
	DataType,
	IndicatorPropsType,
} from 'pragmatic-drag-and-drop-tree';
import SampleRow from '../SampleRow/SampleRow';

const SampleDropGhostIndicator = ({
	indentLevel,
	indentSize,
	instruction,
	item,
}: IndicatorPropsType<DataType>) => (
	<SampleRow
		draggedItem={null}
		indentLevel={indentLevel}
		indentSize={indentSize}
		indicatorType='ghost'
		instruction={instruction}
		item={item}
		state='indicator'
	/>
);

export default SampleDropGhostIndicator;
