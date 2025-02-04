import type { ItemType } from 'pragmatic-drag-and-drop-tree';

// TODO: Make all these operations mutable since we operate on a clone

export const remove = (
	data: Array<ItemType>,
	id: ItemType['id'],
): Array<ItemType> => {
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

export const insertBefore = (
	data: Array<ItemType>,
	targetId: ItemType['id'],
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

export const insertAfter = (
	data: Array<ItemType>,
	targetId: ItemType['id'],
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

export const insertChild = (
	data: Array<ItemType>,
	targetId: ItemType['id'],
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

		if (!item.items?.length) return item;

		return {
			...item,
			items: insertChild(item.items || [], targetId, newItem),
		};
	});
};
