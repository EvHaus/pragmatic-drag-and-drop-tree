import type {
	DropTargetRecord,
	ElementDragType,
} from '@atlaskit/pragmatic-drag-and-drop/types';
import type { Instruction } from './tree-item-hitbox';

export type DataType = Record<string, unknown>;

export type DropPayloadType<D extends DataType> = {
	instruction: Instruction;
	source: ElementDragType['payload'];
	target: DropTargetRecord & { data: ItemType<D> };
};

// TODO: Should this be 'extends'?
export type ItemType<D = DataType> = {
	allowedInstructions?: Array<Instruction['type']> | false;
	data?: D;
	id: string | number;
	isDraggable?: boolean;
	isOpen?: boolean;
	items?: Array<ItemType<D>>;
};

export type ChildrenPropsType<D extends DataType> = {
	item: ItemType<D>;
	onExpandToggle?: (info: {
		event?: React.MouseEvent | React.KeyboardEvent;
		item: ItemType<D>;
		isOpen: boolean;
	}) => void;
};

export type PropsType<D extends DataType> = {
	children?: (childProps: ChildrenPropsType<D>) => React.ReactNode;
	isFirstLevelHidden?: boolean;
	items: Array<ItemType<D>>;
	onDrop?: (payload: DropPayloadType<D>) => void;
	onExpandToggle?: ChildrenPropsType<D>['onExpandToggle'];
};
