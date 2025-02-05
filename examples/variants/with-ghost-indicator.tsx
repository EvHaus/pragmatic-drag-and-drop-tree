import SortableTree from 'pragmatic-drag-and-drop-tree';
import SampleChildren from '../components/SampleChildren/SampleChildren';
import SampleDropGhostIndicator from '../components/SampleDropGhostIndicator/SampleDropGhostIndicator';
import SamplePreview from '../components/SamplePreview/SamplePreview';
import SampleRow from '../components/SampleRow/SampleRow';
import useLocalTreeData from '../data/useLocalTreeData';

const WithGhostIndicator = () => {
	const { getAllowedDropInstructions, handleDrop, handleExpandToggle, items } =
		useLocalTreeData();

	return (
		<SortableTree
			getAllowedDropInstructions={getAllowedDropInstructions}
			indicatorType='ghost'
			items={items}
			onDrop={handleDrop}
			onExpandToggle={handleExpandToggle}
			renderIndicator={SampleDropGhostIndicator}
			renderPreview={SamplePreview}
			renderRow={SampleRow}
		>
			{SampleChildren}
		</SortableTree>
	);
};

export default WithGhostIndicator;
