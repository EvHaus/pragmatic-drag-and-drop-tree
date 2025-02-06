import type { ItemType, PropsType } from 'pragmatic-drag-and-drop-tree';
import { useState } from 'react';
import { recursiveMap } from '../../src/utilities';
import { type DataType, type IdType, SAMPLE_TREE_DATA } from '../data/sample';
import {
	findInTree,
	insertAfter,
	insertBefore,
	insertChild,
	remove,
} from '../utilities/tree';

const useTreeData = () => {
	const [items, setItems] =
		useState<Array<ItemType<IdType, DataType>>>(SAMPLE_TREE_DATA);

	const handleDrop: PropsType<IdType, DataType>['onDrop'] = ({
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

	const handleExpandToggle: PropsType<IdType, DataType>['onExpandToggle'] = ({
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

	const getAllowedDropInstructions: PropsType<
		IdType,
		DataType
	>['getAllowedDropInstructions'] = ({ source, target }) => {
		// Don't allow dropping on yourself
		if (source.data.id === target.data.id) return [];

		const DEFAULT_ALLOWED_DROP_INSTRUCTIONS = [
			'reparent' as const,
			'reorder-above' as const,
			'reorder-below' as const,
		];

		// Only folders can have children
		if (target.data.data.type === 'category')
			return [...DEFAULT_ALLOWED_DROP_INSTRUCTIONS, 'make-child'];

		return DEFAULT_ALLOWED_DROP_INSTRUCTIONS;
	};

	return {
		getAllowedDropInstructions,
		handleDrop,
		handleExpandToggle,
		items,
	};
};

export default useTreeData;
