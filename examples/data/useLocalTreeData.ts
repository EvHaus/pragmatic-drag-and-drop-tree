import type { ItemType, PropsType } from 'pragmatic-drag-and-drop-tree';
import { useState } from 'react';
import { findInTree, recursiveMap } from '../../src/utilities';
import { type DataType, SAMPLE_TREE_DATA } from '../data/sample';
import {
	insertAfter,
	insertBefore,
	insertChild,
	remove,
} from '../utilities/tree';

const useTreeData = () => {
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
			// @ts-expect-error TODO: Fix me
			return setItems(result);
		}

		if (instruction.type === 'reorder-below') {
			let result = remove(clonedItems, source.data.id);
			result = insertAfter(result, target.data.id, item);
			// @ts-expect-error TODO: Fix me
			return setItems(result);
		}

		if (instruction.type === 'make-child') {
			let result = remove(clonedItems, source.data.id);
			result = insertChild(result, target.data.id, item);
			// @ts-expect-error TODO: Fix me
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

	const getAllowedDropInstructions: PropsType<DataType>['getAllowedDropInstructions'] =
		({ source, target }) => {
			// Don't allow dropping on yourself
			if (source.data.id === target.data.id) return [];

			const DEFAULT_ALLOWED_DROP_INSTRUCTIONS = [
				'reparent' as const,
				'reorder-above' as const,
				'reorder-below' as const,
			];

			// Only folders can have children
			// @ts-expect-error TODO: Fix me. Shouldn't require a ? for data
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
