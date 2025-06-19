import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import {
	applyInstructionBlock,
	attachInstruction,
	extractInstruction,
	getInstruction,
} from '../tree-item-hitbox';
import type {
	DataType,
	DragStateType,
	DropPayloadType,
	IdType,
	ItemType,
	PropsType as SharedPropsType,
} from '../types';
import { delay } from '../utilities';

type PropsType<ID extends IdType, D extends DataType> = {
	children: SharedPropsType<ID, D>['renderRow'];
	draggedItem: ItemType<ID, D> | null;
	getAllowedDropInstructions: NonNullable<
		SharedPropsType<ID, D>['getAllowedDropInstructions']
	>;
	getPathToItem: (itemId: ID) => Array<ID>;
	indentLevel: number;
	indentSize: NonNullable<SharedPropsType<ID, D>['indentSize']>;
	indicatorType: NonNullable<SharedPropsType<ID, D>['indicatorType']>;
	item: ItemType<ID, D>;
	mode: ItemMode;
	onExpandToggle?: SharedPropsType<ID, D>['onExpandToggle'];
	renderIndicator: SharedPropsType<ID, D>['renderIndicator'];
	renderPreview: SharedPropsType<ID, D>['renderPreview'];
	uniqueContextId: symbol;
};

function getParentLevelOfInstruction(instruction: Instruction): number {
	if (instruction.type === 'instruction-blocked') {
		return getParentLevelOfInstruction(instruction.desired);
	}
	if (instruction.type === 'reparent') {
		return instruction.desiredLevel - 1;
	}
	return instruction.currentLevel - 1;
}

const SortableTreeItem = <ID extends IdType, D extends DataType>({
	children,
	draggedItem,
	getAllowedDropInstructions,
	getPathToItem,
	indentLevel,
	indentSize,
	indicatorType,
	item,
	mode,
	onExpandToggle,
	renderIndicator,
	renderPreview,
	uniqueContextId,
}: PropsType<ID, D>) => {
	const itemRef = useRef<HTMLElement | null>(null);
	const dragHandleRef = useRef<HTMLElement | null>(null);

	const [state, setState] = useState<DragStateType>('idle');
	const [instruction, setInstruction] = useState<Instruction | null>(null);
	const cancelExpandRef = useRef<(() => void) | null>(null);

	const cancelExpand = useCallback(() => {
		cancelExpandRef.current?.();
		cancelExpandRef.current = null;
	}, []);

	const clearParentOfInstructionState = useCallback(() => {
		setState((current) =>
			current === 'parent-of-instruction' ? 'idle' : current,
		);
	}, []);

	// When an item has an instruction applied
	// we are highlighting its parent item for improved clarity
	const shouldHighlightParent = useCallback(
		(location: DragLocationHistory): boolean => {
			const target = location.current.dropTargets[0];
			if (!target) return false;

			const instruction = extractInstruction(target.data);
			if (!instruction) return false;

			const targetId = target.data.id as ID;
			if (!targetId) return false;

			const path = getPathToItem(targetId);
			const parentLevel: number = getParentLevelOfInstruction(instruction);
			const parentId = path[parentLevel];
			return parentId === item.id;
		},
		[getPathToItem, item],
	);

	useEffect(() => {
		function updateIsParentOfInstruction({
			location,
		}: {
			location: DragLocationHistory;
		}) {
			if (shouldHighlightParent(location)) {
				setState('parent-of-instruction');
				return;
			}
			clearParentOfInstructionState();
		}

		if (!itemRef.current) return;

		return combine(
			draggable({
				canDrag: () => item.isDraggable ?? true,
				dragHandle: dragHandleRef.current ?? undefined,
				element: itemRef.current,
				getInitialData: () => ({
					...item,
					isOpenOnDragStart: item.isOpen,
					uniqueContextId,
				}),
				onDragStart: ({ source }) => {
					setState('dragging');

					// collapse open items during a drag
					if (source.data.isOpenOnDragStart) {
						onExpandToggle?.({ isOpen: false, item });
					}
				},
				onDrop: ({ source }) => {
					setState('idle');

					if (source.data.isOpenOnDragStart) {
						onExpandToggle?.({ isOpen: true, item });
					}
				},
				onGenerateDragPreview: ({ nativeSetDragImage }) => {
					if (renderPreview) {
						setCustomNativeDragPreview({
							getOffset: pointerOutsideOfPreview({ x: '8px', y: '8px' }),
							nativeSetDragImage,
							render: ({ container }) => {
								const root = createRoot(container);
								root.render(renderPreview({ item }));
								return () => root.unmount();
							},
						});
					}
				},
			}),
			dropTargetForElements({
				canDrop: ({ source }) => {
					return source.data.uniqueContextId === uniqueContextId;
				},
				element: itemRef.current,
				getData: ({ input, element, source }) => {
					const data = { ...item };

					const allowedInstructions = getAllowedDropInstructions({
						source: source as DropPayloadType<ID, D>['source'],
						target: { data, element },
					});

					let instruction = getInstruction({
						allowedInstructions,
						currentLevel: indentLevel,
						element,
						indentSize,
						input,
						mode,
					});

					if (!allowedInstructions.includes(instruction.type)) {
						instruction = applyInstructionBlock({
							allowedInstructions,
							desired: instruction,
						});
					}

					return attachInstruction(data, instruction);
				},
				getIsSticky: () => true,
				onDrag: ({ self, source }) => {
					const instruction = extractInstruction(self.data);

					if (source.data.id !== item.id) {
						// expand after 500ms if still merging
						if (
							instruction?.type === 'make-child' &&
							item.isExpandable &&
							!item.isOpen &&
							!cancelExpandRef.current
						) {
							cancelExpandRef.current = delay({
								fn: () => onExpandToggle?.({ isOpen: true, item }),
								waitMs: 500,
							});
						}
						if (instruction?.type !== 'make-child' && cancelExpandRef.current) {
							cancelExpand();
						}

						setInstruction(instruction);
						return;
					}
					if (instruction?.type === 'reparent') {
						setInstruction(instruction);
						return;
					}
					setInstruction(null);
				},
				onDragLeave: () => {
					cancelExpand();
					// rAF here removes the slight flash of the indicator as
					// the cursor moves from one item over to another
					requestAnimationFrame(() => {
						setInstruction(null);
					});
				},
				onDrop: () => {
					cancelExpand();
					setInstruction(null);
				},
			}),
			monitorForElements({
				canMonitor: ({ source }) =>
					source.data.uniqueContextId === uniqueContextId,
				onDrag: updateIsParentOfInstruction,
				onDragStart: updateIsParentOfInstruction,
				onDrop: clearParentOfInstructionState,
			}),
		);
	}, [
		cancelExpand,
		clearParentOfInstructionState,
		getAllowedDropInstructions,
		indentLevel,
		indentSize,
		item,
		mode,
		onExpandToggle,
		renderPreview,
		shouldHighlightParent,
		uniqueContextId,
	]);

	useEffect(() => {
		return () => {
			cancelExpand();
		};
	}, [cancelExpand]);

	const subTreeId = `tree-item-${item.id}--subtree`;
	const hasChildren = Boolean(item.items?.length);

	return (
		<Fragment>
			{instruction?.type === 'reorder-above' && draggedItem && renderIndicator
				? renderIndicator({
						indentLevel,
						indentSize,
						instruction,
						item: draggedItem,
					})
				: null}
			{children?.({
				'aria-controls': item.isExpandable ? subTreeId : undefined,
				'aria-expanded': item.isExpandable ? item.isOpen : undefined,
				draggedItem,
				dragHandleRef,
				indentLevel,
				indentSize,
				indicatorType,
				instruction,
				item,
				itemRef,
				onExpandToggle,
				state,
			})}
			{instruction?.type === 'reorder-below' && draggedItem && renderIndicator
				? renderIndicator({
						indentLevel,
						indentSize,
						instruction,
						item: draggedItem,
					})
				: null}
			{hasChildren && item.isOpen ? (
				// TODO: Need to make this element configurable
				<ul id={subTreeId} style={{ padding: 0 }}>
					{item.items?.map((child, index, array) => {
						const childType: ItemMode = (() => {
							if (child.items?.length && child.isOpen) return 'expanded';
							if (index === array.length - 1) return 'last-in-group';
							return 'standard';
						})();
						return (
							<SortableTreeItem<ID, D>
								draggedItem={draggedItem}
								getAllowedDropInstructions={getAllowedDropInstructions}
								getPathToItem={getPathToItem}
								indentLevel={indentLevel + 1}
								indentSize={indentSize}
								indicatorType={indicatorType}
								item={child}
								key={child.id}
								mode={childType}
								onExpandToggle={onExpandToggle}
								renderIndicator={renderIndicator}
								renderPreview={renderPreview}
								uniqueContextId={uniqueContextId}
							>
								{children}
							</SortableTreeItem>
						);
					})}
					{/* TODO: Will users want to customize the placement of this? Right now it always goes to the bottom */}
					{instruction?.type === 'make-child' &&
					indicatorType === 'ghost' &&
					draggedItem &&
					renderIndicator
						? renderIndicator({
								indentLevel: indentLevel + 1,
								indentSize,
								instruction: null,
								item: draggedItem,
							})
						: null}
				</ul>
			) : null}
		</Fragment>
	);
};

export default SortableTreeItem;
