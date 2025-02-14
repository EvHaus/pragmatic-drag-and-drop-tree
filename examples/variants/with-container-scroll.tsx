import SortableTree from 'pragmatic-drag-and-drop-tree';
import SampleDropLineIndicator from '../components/SampleDropLineIndicator/SampleDropLineIndicator';
import SamplePreview from '../components/SamplePreview/SamplePreview';
import SampleRow from '../components/SampleRow/SampleRow';
import rowStyles from '../components/SampleRow/SampleRow.module.css';
import useLocalTreeData from '../data/useLocalTreeData';

const WithLineIndicator = () => {
	const { getAllowedDropInstructions, handleDrop, handleExpandToggle, items } =
		useLocalTreeData();

	return (
		<SortableTree
			flashClass={rowStyles.flash}
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
					ref={containerRef}
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
