import SortableTree from 'pragmatic-drag-and-drop-tree';
import SampleChildren from '../components/SampleChildren/SampleChildren';
import SampleDropLineIndicator from '../components/SampleDropLineIndicator/SampleDropLineIndicator';
import SamplePreview from '../components/SamplePreview/SamplePreview';
import SampleRow from '../components/SampleRow/SampleRow';
import type { DataType } from '../data/sample';
import useLocalTreeData from '../data/useLocalTreeData';

const WithLineIndicator = () => {
	const { getAllowedDropInstructions, handleDrop, handleExpandToggle, items } =
		useLocalTreeData();

	return (
		<SortableTree<DataType>
			getAllowedDropInstructions={getAllowedDropInstructions}
			items={items}
			onDrop={handleDrop}
			onExpandToggle={handleExpandToggle}
			renderIndicator={SampleDropLineIndicator}
			renderPreview={SamplePreview}
			renderRow={SampleRow}
		>
			{SampleChildren}
		</SortableTree>
	);
};

export default WithLineIndicator;
