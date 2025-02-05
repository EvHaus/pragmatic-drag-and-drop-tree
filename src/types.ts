import type {
	DropTargetRecord,
	ElementDragType,
} from '@atlaskit/pragmatic-drag-and-drop/types';
import type { JSX } from 'react';
import type { Instruction } from './tree-item-hitbox';

export type DataType = Record<string, unknown> | undefined;

export type DragStateType =
	| 'idle'
	| 'indicator'
	| 'dragging'
	| 'preview'
	| 'parent-of-instruction';

export type DropPayloadType<D extends DataType> = {
	instruction: Instruction;
	source: ElementDragType['payload'] & { data: ItemType<D> };
	target: DropTargetRecord & { data: ItemType<D> };
};

type IndentSizeType = number;
type IndicatorTypeType = 'ghost' | 'line';

export type ItemType<
	D extends DataType = DataType,
	I extends string | number = string | number,
> = {
	data: D;
	id: I;
	isDraggable?: boolean;
	isOpen?: boolean;
	items?: Array<ItemType<D>>;
};

export type ChildPropsType = {
	children: React.ReactNode;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	containerRef: React.RefObject<any>;
};

export type RowPropsType<D extends DataType> = {
	'aria-controls'?: string;
	'aria-expanded'?: boolean;
	draggedItem: ItemType<D> | null;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	dragHandleRef?: React.RefObject<any>;
	indentLevel: number;
	indentSize: IndentSizeType;
	indicatorType: IndicatorTypeType;
	instruction: Instruction | null;
	item: ItemType<D>;
	// biome-ignore lint/suspicious/noExplicitAny: Can't figure how to make this HTMLElement
	itemRef?: React.RefObject<any>;
	onExpandToggle?: (info: {
		event?: React.MouseEvent | React.KeyboardEvent;
		item: ItemType<D>;
		isOpen: boolean;
	}) => void;
	state: DragStateType;
};

export type IndicatorPropsType<D extends DataType> = Pick<
	RowPropsType<D>,
	'instruction' | 'indentLevel' | 'indentSize'
> & {
	item?: ItemType<D> | null;
};

export type PreviewPropsType<D extends DataType> = {
	item: ItemType<D>;
};

export type PropsType<D extends DataType> = {
	children?: (childProps: ChildPropsType) => JSX.Element;
	getAllowedDropInstructions?: (
		payload: Pick<DropPayloadType<D>, 'source' | 'target'>,
	) => Array<Instruction['type']>;
	indentSize?: IndentSizeType;
	indicatorType?: IndicatorTypeType;
	items: Array<ItemType<D>>;
	onDrop?: (payload: DropPayloadType<D>) => void;
	onExpandToggle?: RowPropsType<D>['onExpandToggle'];
	renderIndicator?: (indicatorProps: IndicatorPropsType<D>) => React.ReactNode;
	renderPreview?: (previewProps: PreviewPropsType<D>) => React.ReactNode;
	renderRow?: (rowProps: RowPropsType<D>) => React.ReactNode;
};
