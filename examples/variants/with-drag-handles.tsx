import SortableTree from 'pragmatic-drag-and-drop-tree';
import SampleChildren from '../components/SampleChildren/SampleChildren';
import SampleDropLineIndicator from '../components/SampleDropLineIndicator/SampleDropLineIndicator';
import SamplePreview from '../components/SamplePreview/SamplePreview';
import SampleRow from '../components/SampleRow/SampleRow';
import useLocalTreeData from '../data/useLocalTreeData';

const WithDragHandles = () => {
	const { getAllowedDropInstructions, handleDrop, handleExpandToggle, items } =
		useLocalTreeData();

	return (
		<SortableTree
			getAllowedDropInstructions={getAllowedDropInstructions}
			items={items}
			onDrop={handleDrop}
			onExpandToggle={handleExpandToggle}
			renderIndicator={SampleDropLineIndicator}
			renderPreview={SamplePreview}
			renderRow={(rowProps) => (
				<SampleRow {...rowProps} withDragHandle={true} />
			)}
		>
			{SampleChildren}
		</SortableTree>
	);
};

export default WithDragHandles;
