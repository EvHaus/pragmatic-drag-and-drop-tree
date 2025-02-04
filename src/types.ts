import type {
	DropTargetRecord,
	ElementDragType,
} from '@atlaskit/pragmatic-drag-and-drop/types';
import type { JSX } from 'react';
import type { Instruction } from './tree-item-hitbox';

export type DataType = Record<string, unknown>;

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

// TODO: Should this be 'extends'?
export type ItemType<D = DataType> = {
	data?: D;
	id: string | number;
	isDraggable?: boolean;
	isOpen?: boolean;
	items?: Array<ItemType<D>>;
};

export type ChildPropsType = {
	children: React.ReactNode;
	containerRef: React.RefObject<HTMLElement | null>;
};

export type RowPropsType<D extends DataType> = {
	'aria-controls'?: string;
	'aria-expanded'?: boolean;
	draggedItem: ItemType<D> | null;
	dragHandleRef?: React.RefObject<HTMLElement | null>;
	indentLevel: number;
	indentSize: NonNullable<PropsType<D>['indentSize']>;
	indicatorType: PropsType<D>['indicatorType'];
	instruction: Instruction | null;
	item: ItemType<D>;
	itemRef?: React.RefObject<HTMLElement | null>;
	onExpandToggle?: (info: {
		event?: React.MouseEvent | React.KeyboardEvent;
		item: ItemType<D>;
		isOpen: boolean;
	}) => void;
	state: DragStateType;
};

export type IndicatorPropsType<D extends DataType> = Pick<
	RowPropsType<D>,
	'instruction' | 'indentLevel' | 'indentSize' | 'item'
>;

export type PreviewPropsType<D extends DataType> = {
	item: ItemType<D>;
};

export type PropsType<D extends DataType> = {
	children?: (childProps: ChildPropsType) => JSX.Element;
	getAllowedDropInstructions?: (
		payload: Pick<DropPayloadType<D>, 'source' | 'target'>,
	) => Array<Instruction['type']>;
	indentSize?: number;
	indicatorType?: 'ghost' | 'line';
	// TODO: Need a way to do this.
	// isFirstLevelHidden?: boolean;
	items: Array<ItemType<D>>;
	onDrop?: (payload: DropPayloadType<D>) => void;
	onExpandToggle?: RowPropsType<D>['onExpandToggle'];
	renderIndicator?: (indicatorProps: IndicatorPropsType<D>) => React.ReactNode;
	renderPreview?: (previewProps: PreviewPropsType<D>) => React.ReactNode;
	renderRow?: (rowProps: RowPropsType<D>) => React.ReactNode;
};
