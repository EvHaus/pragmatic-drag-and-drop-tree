import type { ItemMode } from './tree-item-hitbox';
import type { DataType, IdType, ItemType } from './types';

export const getItemMode = <ID extends IdType, D extends DataType>(
	item: ItemType<ID, D>,
	index: number,
	array: Array<ItemType<ID, D>>,
): ItemMode => {
	if (item.items?.length && item.isOpen) return 'expanded';
	if (index === array.length - 1) return 'last-in-group';
	return 'standard';
};

export const delay = ({ waitMs, fn }: { waitMs: number; fn: () => void }) => {
	let timeoutId: number | null = window.setTimeout(() => {
		timeoutId = null;
		fn();
	}, waitMs);
	return function cancel() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
};

export const getPathToItem = <ID extends IdType, D extends DataType>({
	current,
	targetId,
	parentIds = [],
}: {
	current: Array<ItemType<ID, D>>;
	targetId: ID;
	parentIds?: Array<ID>;
}): Array<ID> | undefined => {
	for (const item of current) {
		if (item.id === targetId) {
			return parentIds;
		}
		const nested = getPathToItem({
			current: item.items || [],
			parentIds: [...parentIds, item.id],
			targetId,
		});
		if (nested) {
			return nested;
		}
	}
};

export const recursiveMap = <Item extends ItemType<IdType, DataType>>(
	items: Array<Item>,
	callback: (item: Item, parent?: Item) => Item | null | undefined,
) => {
	const result = [];
	for (const item of items) {
		const newItem = callback(structuredClone(item));
		if (!newItem) continue;

		if (newItem.items?.length) {
			newItem.items = recursiveMap(newItem.items, (child) =>
				// @ts-expect-error FIX ME
				callback(child, newItem),
			);
		}

		result.push(newItem);
	}
	return result;
};
