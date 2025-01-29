import type { DataType, ItemType } from './types';

export const delay = ({
	waitMs: timeMs,
	fn,
}: { waitMs: number; fn: () => void }) => {
	let timeoutId: number | null = window.setTimeout(() => {
		timeoutId = null;
		fn();
	}, timeMs);
	return function cancel() {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
};

export const findInTree = <Item extends ItemType>(
	items: Array<Item>,
	itemId: Item['id'],
): Item | undefined => {
	for (const item of items) {
		if (item.id === itemId) return item;

		if (item.items?.length) {
			const result = findInTree(item.items, itemId);
			if (result) {
				return result as Item;
			}
		}
	}
};

export const recursiveMap = <Item extends ItemType<DataType>>(
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
