import { createContext } from 'react';
import type { DataType, ItemType } from '../types';

export type SortableTreeContextValue<D extends DataType> = {
	uniqueContextId: symbol;
	getPathToItem: (itemId: ItemType['id']) => Array<ItemType['id']>;
	getMoveTargets: ({
		itemId,
	}: { itemId: ItemType['id'] }) => Array<ItemType<D>>;
	getChildrenOfItem: (itemId: ItemType['id']) => Array<ItemType<D>>;
};

export const SortableTreeContext = createContext<
	SortableTreeContextValue<DataType>
>({
	uniqueContextId: Symbol('uniqueId'),
	getPathToItem: () => [],
	getMoveTargets: () => [],
	getChildrenOfItem: () => [],
});
