import SortableTree, {
	type ItemType,
	type PropsType,
} from 'pragmatic-drag-and-drop-tree';
import { useState } from 'react';
import { findInTree, recursiveMap } from '../src/SortableTree/utilities';
import { type DataType, SAMPLE_TREE_DATA } from './sample-tree-data';

// TODO: Make all these operations mutable since we operate on a clone

const remove = (data: Array<ItemType>, id: string): Array<ItemType> => {
	return data
		.filter((item) => item.id !== id)
		.map((item) => {
			if (item.items?.length) {
				return {
					...item,
					items: remove(item.items, id),
				};
			}
			return item;
		});
};

const insertBefore = (
	data: Array<ItemType>,
	targetId: string,
	newItem: ItemType,
): Array<ItemType> => {
	return data.flatMap((item) => {
		if (item.id === targetId) {
			return [newItem, item];
		}
		if (item.items?.length) {
			return {
				...item,
				items: insertBefore(item.items, targetId, newItem),
			};
		}
		return item;
	});
};

const insertAfter = (
	data: Array<ItemType>,
	targetId: string,
	newItem: ItemType,
): Array<ItemType> => {
	return data.flatMap((item) => {
		if (item.id === targetId) {
			return [item, newItem];
		}

		if (item.items?.length) {
			return {
				...item,
				items: insertAfter(item.items, targetId, newItem),
			};
		}

		return item;
	});
};

const insertChild = (
	data: Array<ItemType>,
	targetId: string,
	newItem: ItemType,
): Array<ItemType> => {
	return data.flatMap((item) => {
		if (item.id === targetId) {
			// already a parent: add as first child
			return {
				...item,
				// opening item so you can see where item landed
				isOpen: true,
				items: [...(item.items || []), newItem],
			};
		}

		if (item.items?.length) {
			return item;
		}

		return {
			...item,
			items: insertChild(item.items || [], targetId, newItem),
		};
	});
};

const App = () => {
	const [items, setItems] =
		useState<Array<ItemType<DataType>>>(SAMPLE_TREE_DATA);

	const handleDrop: PropsType<DataType>['onDrop'] = ({
		instruction,
		source,
		target,
	}) => {
		const item = findInTree(items, source.data.id);
		if (!item) return;

		const clonedItems = structuredClone(items);

		if (source.data.id === target.data.id) return;

		if (instruction.type === 'reorder-above') {
			let result = remove(clonedItems, source.data.id);
			result = insertBefore(result, target.data.id, item);
			console.log('inserting', item, 'before', target.data.id);
			return setItems(result);
		}

		if (instruction.type === 'reorder-below') {
			let result = remove(clonedItems, source.data.id);
			result = insertAfter(result, target.data.id, item);
			return setItems(result);
		}

		if (instruction.type === 'make-child') {
			let result = remove(clonedItems, source.data.id);
			result = insertChild(result, target.data.id, item);
			return setItems(result);
		}

		console.warn('TODO: action not implemented', instruction);
	};

	const handleExpandToggle: PropsType<DataType>['onExpandToggle'] = ({
		item: toggledItem,
		isOpen,
	}) => {
		setItems(
			recursiveMap(items, (item) => {
				if (item.id === toggledItem.id) {
					item.isOpen = isOpen;
				}
				return item;
			}),
		);
	};

	const validateDrop: PropsType<DataType>['validateDrop'] = ({
		instruction,
		source,
		target,
	}) => {
		if (instruction.type === 'reorder-above') {
			return target.data.id !== source.data.id;
		}

		if (instruction.type === 'reorder-below') {
			return target.data.id !== source.data.id;
		}

		if (instruction.type === 'make-child') {
			return target.data.id !== source.data.id;
		}
	};

	return (
		<div
			style={{
				border: '1px solid black',
				margin: '0 auto',
				width: '300px',
			}}
		>
			<SortableTree<DataType>
				items={items}
				onDrop={handleDrop}
				onExpandToggle={handleExpandToggle}
				validateDrop={validateDrop}
			/>
		</div>
	);
};

export default App;
