import type {
	DropTargetRecord,
	ElementDragType,
} from '@atlaskit/pragmatic-drag-and-drop/types';
import type { JSX } from 'react';
import type { Instruction } from './tree-item-hitbox';

export type DataType = Record<string, unknown> | undefined;
export type IdType = string | number;

export type DragStateType =
	| 'idle'
	| 'indicator'
	| 'dragging'
	| 'preview'
	| 'parent-of-instruction';

export type DropPayloadType<ID extends IdType, D extends DataType> = {
	instruction: Instruction;
	source: ElementDragType['payload'] & { data: ItemType<ID, D> };
	target: DropTargetRecord & { data: ItemType<ID, D> };
};

type IndentSizeType = number;
type IndicatorTypeType = 'ghost' | 'line';

export type ItemType<ID extends IdType, D extends DataType = DataType> = {
	data: D;
	id: ID;
	isDraggable?: boolean;
	isExpandable?: boolean;
	isOpen?: boolean;
	items?: Array<ItemType<ID, D>>;
};

export type ChildPropsType = {
	children: React.ReactNode;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	containerRef: React.RefObject<any>;
};

export type RowPropsType<ID extends IdType, D extends DataType> = {
	'aria-controls'?: string;
	'aria-expanded'?: boolean;
	draggedItem: ItemType<ID, D> | null;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	dragHandleRef?: React.RefObject<any>;
	indentLevel: number;
	indentSize: IndentSizeType;
	indicatorType: IndicatorTypeType;
	instruction: Instruction | null;
	item: ItemType<ID, D>;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	itemRef?: React.RefObject<any>;
	onExpandToggle?: (info: {
		event?: React.MouseEvent | React.KeyboardEvent;
		item: ItemType<ID, D>;
		isOpen: boolean;
	}) => void;
	state: DragStateType;
};

export type IndicatorPropsType<ID extends IdType, D extends DataType> = Pick<
	RowPropsType<ID, D>,
	'instruction' | 'indentLevel' | 'indentSize'
> & {
	item?: ItemType<ID, D> | null;
};

export type PreviewPropsType<ID extends IdType, D extends DataType> = {
	item: ItemType<ID, D>;
};

export type PropsType<ID extends IdType, D extends DataType> = {
	children: (childProps: ChildPropsType) => JSX.Element;
	flashClass?: string;
	getAllowedDropInstructions?: (payload: {
		source: DropPayloadType<ID, D>['source'];
		target: {
			data: ItemType<ID, D>;
			element: Element;
		};
	}) => Array<Instruction['type']>;
	indentSize?: IndentSizeType;
	indicatorType?: IndicatorTypeType;
	items: Array<ItemType<ID, D>>;
	onDrop?: (payload: DropPayloadType<ID, D>) => void;
	onExpandToggle?: RowPropsType<ID, D>['onExpandToggle'];
	renderIndicator?: (
		indicatorProps: IndicatorPropsType<ID, D>,
	) => React.ReactNode;
	renderPreview?: (previewProps: PreviewPropsType<ID, D>) => React.ReactNode;
	renderRow?: (rowProps: RowPropsType<ID, D>) => React.ReactNode;
};
