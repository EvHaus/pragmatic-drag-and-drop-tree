import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
	draggable,
	dropTargetForElements,
	monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import type { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/types';
import clsx from 'clsx';
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
import { attachInstruction, extractInstruction } from '../tree-item-hitbox';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import type { ChildrenPropsType, DataType, ItemType } from '../types';
import { SortableTreeContext } from './SortableTreeContext';
import SortableTreeDropIndicator from './SortableTreeDropIndicator';
import styles from './SortableTreeItem.module.css';
import { getIndentSize } from './treeStructures';

type PropsType<D extends DataType> = {
	children: (props: ChildrenPropsType<D>) => React.ReactNode;
	index: number;
	isFirstLevelHidden?: boolean;
	item: ItemType<D>;
	level: number;
	mode: ItemMode;
	onExpandToggle?: ChildrenPropsType<D>['onExpandToggle'];
};

function Preview({ item }: { item: ItemType }) {
	return <div className={styles.preview}>{item.id}</div>;
}

function getParentLevelOfInstruction(instruction: Instruction): number {
	if (instruction.type === 'instruction-blocked') {
		return getParentLevelOfInstruction(instruction.desired);
	}
	if (instruction.type === 'reparent') {
		return instruction.desiredLevel - 1;
	}
	return instruction.currentLevel - 1;
}

function delay({
	waitMs: timeMs,
	fn,
}: { waitMs: number; fn: () => void }): () => void {
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
}

const SortableTreeItem = <D extends DataType>({
	children,
	index,
	isFirstLevelHidden = false,
	item,
	level,
	mode,
	onExpandToggle,
}: PropsType<D>) => {
	const buttonRef = useRef<HTMLDivElement>(null);

	const [state, setState] = useState<
		'idle' | 'dragging' | 'preview' | 'parent-of-instruction'
	>('idle');
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
	// we are highlighting it's parent item for improved clarity
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

		if (!buttonRef.current) return;

		return combine(
			draggable({
				canDrag: () => item.isDraggable || true,
				element: buttonRef.current,
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
							root.render(<Preview item={item} />);
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
				element: buttonRef.current,
				getData: ({ input, element, source }) => {
					const data = { ...item };

					// Some items cannot be parents
					const block: Parameters<typeof attachInstruction>[1]['block'] = [];

					// If nothing is allowed, return no instructions
					if (item.allowedInstructions === false) return data;

					// Don't allow dropping on yourself
					if (source.data.id === item.id) return data;

					// TODO: Switch to validator
					for (const instructionType of [
						'reorder-above',
						'reorder-below',
						'make-child',
						// TODO: Look at 'tree-item-hitbox' to better understand when reparent happens
						'reparent',
						'instruction-blocked',
					] as const) {
						if (!item.allowedInstructions?.includes(instructionType)) {
							block.push(instructionType);
						}
					}

					return attachInstruction(data, {
						block,
						currentLevel: level,
						element,
						indentPerLevel: getIndentSize(1, isFirstLevelHidden),
						input,
						mode,
					});
				},
				getIsSticky: () => true,
				onDrag: ({ self, source }) => {
					const instruction = extractInstruction(self.data);

					if (source.data.id !== item.id) {
						// expand after 500ms if still merging
						if (
							instruction?.type === 'make-child' &&
							item.items?.length &&
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
		isFirstLevelHidden,
		item,
		level,
		mode,
		onExpandToggle,
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

	const aria = (() => {
		if (!item.items?.length) {
			return undefined;
		}
		return {
			'aria-expanded': item.isOpen,
			'aria-controls': `tree-item-${item.id}--subtree`,
		};
	})();

	const indentInPixels = getIndentSize(level, isFirstLevelHidden);

	return (
		<Fragment>
			<div
				{...aria}
				className={clsx(
					styles.button,
					state === 'idle' ? styles.buttonIdle : {},
					state === 'dragging' ? styles.buttonDragging : null,
					state === 'parent-of-instruction'
						? styles.buttonParentOfInstruction
						: null,
				)}
				/* Is this removable? */
				data-index={index}
				data-level={level}
				id={`tree-item-${item.id}`}
				ref={buttonRef}
				style={{ paddingLeft: indentInPixels }}
			>
				{children({ item, onExpandToggle })}
				{instruction ? (
					<SortableTreeDropIndicator
						indent={indentInPixels}
						instruction={instruction}
					/>
				) : null}
			</div>
			{item.items?.length && item.isOpen ? (
				<div id={aria?.['aria-controls']}>
					{item.items.map((child, index, array) => {
						const childType: ItemMode = (() => {
							if (child.items?.length && child.isOpen) return 'expanded';
							if (index === array.length - 1) return 'last-in-group';
							return 'standard';
						})();
						return (
							<SortableTreeItem<D>
								index={index}
								isFirstLevelHidden={isFirstLevelHidden}
								item={child}
								key={child.id}
								level={level + 1}
								mode={childType}
								onExpandToggle={onExpandToggle}
							>
								{children}
							</SortableTreeItem>
						);
					})}
				</div>
			) : null}
		</Fragment>
	);
};

export default SortableTreeItem;
