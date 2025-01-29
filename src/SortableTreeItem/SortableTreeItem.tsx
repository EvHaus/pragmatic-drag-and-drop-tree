import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import type React from 'react';
import {
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { SortableTreeContext } from '../SortableTreeContext/SortableTreeContext';
import {
	applyInstructionBlock,
	attachInstruction,
	extractInstruction,
	getInstruction,
} from '../tree-item-hitbox';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import type {
	DataType,
	DragStateType,
	ItemType,
	RowPropsType,
	PropsType as SharedPropsType,
} from '../types';
import { delay } from '../utilities';

type PropsType<D extends DataType> = {
	children: (props: RowPropsType<D>) => React.ReactNode;
	getAllowedDropInstructions: NonNullable<
		SharedPropsType<D>['getAllowedDropInstructions']
	>;
	indentLevel: number;
	indentSize: NonNullable<SharedPropsType<D>['indentSize']>;
	item: ItemType<D>;
	mode: ItemMode;
	onExpandToggle?: SharedPropsType<D>['onExpandToggle'];
	renderPreview: NonNullable<SharedPropsType<D>['renderPreview']>;
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

const SortableTreeItem = <D extends DataType>({
	children,
	getAllowedDropInstructions,
	indentLevel,
	indentSize,
	item,
	mode,
	onExpandToggle,
	renderPreview,
}: PropsType<D>) => {
	const itemRef = useRef<HTMLElement>(null);

	const [state, setState] = useState<DragStateType>('idle');
	const [instruction, setInstruction] = useState<Instruction | null>(null);
	const cancelExpandRef = useRef<(() => void) | null>(null);

	const { uniqueContextId, getPathToItem } = useContext(SortableTreeContext);

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

			const targetId = target.data.id as string;
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
		}: { location: DragLocationHistory }) {
			if (shouldHighlightParent(location)) {
				setState('parent-of-instruction');
				return;
			}
			clearParentOfInstructionState();
		}

		if (!itemRef.current) return;

		return combine(
			draggable({
				canDrag: () => item.isDraggable || true,
				element: itemRef.current,
				getInitialData: () => ({
					...item,
					isOpenOnDragStart: item.isOpen,
					uniqueContextId,
				}),
				onGenerateDragPreview: ({ nativeSetDragImage }) => {
					setCustomNativeDragPreview({
						getOffset: pointerOutsideOfPreview({ x: '8px', y: '8px' }),
						render: ({ container }) => {
							const root = createRoot(container);
							root.render(renderPreview({ item }));
							return () => root.unmount();
						},
						nativeSetDragImage,
					});
				},
				onDragStart: ({ source }) => {
					setState('dragging');

					// collapse open items during a drag
					if (source.data.isOpenOnDragStart) {
						onExpandToggle?.({ item, isOpen: false });
					}
				},
				onDrop: ({ source }) => {
					setState('idle');

					if (source.data.isOpenOnDragStart) {
						onExpandToggle?.({ item, isOpen: true });
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
						// @ts-expect-error TODO: Fix me
						source,
						// @ts-expect-error TODO: Fix me
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
							hasChildren &&
							!item.isOpen &&
							!cancelExpandRef.current
						) {
							cancelExpandRef.current = delay({
								waitMs: 500,
								fn: () => onExpandToggle?.({ item, isOpen: true }),
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
					setInstruction(null);
				},
				onDrop: () => {
					cancelExpand();
					setInstruction(null);
				},
			}),
			monitorForElements({
				canMonitor: ({ source }) =>
					source.data.uniqueContextId === uniqueContextId,
				onDragStart: updateIsParentOfInstruction,
				onDrag: updateIsParentOfInstruction,
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

	useEffect(
		function mount() {
			return function unmount() {
				cancelExpand();
			};
		},
		[cancelExpand],
	);

	const subTreeId = `tree-item-${item.id}--subtree`;
	const hasChildren = Boolean(item.items?.length);

	return (
		<Fragment>
			{children({
				'aria-controls': hasChildren ? subTreeId : undefined,
				'aria-expanded': hasChildren ? item.isOpen : undefined,
				indentLevel,
				indentSize,
				instruction,
				item,
				itemRef,
				onExpandToggle,
				state,
			})}
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
							<SortableTreeItem<D>
								getAllowedDropInstructions={getAllowedDropInstructions}
								indentLevel={indentLevel + 1}
								indentSize={indentSize}
								item={child}
								key={child.id}
								mode={childType}
								onExpandToggle={onExpandToggle}
								renderPreview={renderPreview}
							>
								{children}
							</SortableTreeItem>
						);
					})}
				</ul>
			) : null}
		</Fragment>
	);
};

export default SortableTreeItem;
