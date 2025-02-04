import SortableTree from 'pragmatic-drag-and-drop-tree';
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
			{({ children, containerRef }) => (
				<ol
					ref={containerRef as React.RefObject<HTMLOListElement>}
					style={{
						border: '1px solid #aaa',
						borderRadius: '4px',
						listStyle: 'none',
						margin: '0 auto',
						maxHeight: '200px',
						overflow: 'auto',
						padding: 0,
						width: '300px',
					}}
				>
					{children}
				</ol>
			)}
		</SortableTree>
	);
};

export default WithLineIndicator;
