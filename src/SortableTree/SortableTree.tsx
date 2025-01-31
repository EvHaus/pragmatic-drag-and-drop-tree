import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useMemo, useRef, useState } from 'react';
import SampleChildren from '../SampleChildren/SampleChildren';
import SampleDropGhostIndicator from '../SampleDropGhostIndicator/SampleDropGhostIndicator';
import SampleDropLineIndicator from '../SampleDropLineIndicator/SampleDropLineIndicator';
import SamplePreview from '../SamplePreview/SamplePreview';
import SampleRow from '../SampleRow/SampleRow';
import SortableTreeItem from '../SortableTreeItem/SortableTreeItem';
import { extractInstruction } from '../tree-item-hitbox';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import type { DataType, DropPayloadType, ItemType, PropsType } from '../types';
import { getPathToItem } from '../utilities';

const defaultGetAllowedDropInstructions = () => [
	'reorder-above' as const,
	'reorder-below' as const,
	'make-child' as const,
	'reparent' as const,
];

const SortableTree = <D extends DataType>({
	children,
	getAllowedDropInstructions = defaultGetAllowedDropInstructions,
	indentSize = 16,
	indicatorType = 'ghost',
	items,
	onDrop,
	onExpandToggle,
	renderIndicator,
	renderPreview = SamplePreview,
	renderRow = SampleRow,
}: PropsType<D>) => {
	const [lastAction, setLastAction] = useState<DropPayloadType<D> | null>(null);
	const [draggedItem, setDraggedItem] = useState<ItemType<D> | null>(null);

	const containerRef = useRef<HTMLElement>(null);
	const lastStateRef = useRef<typeof items>(items);

	const uniqueContextId = useMemo(() => Symbol('unique-id'), []);

	useEffect(() => {
		lastStateRef.current = items;
	}, [items]);

	// Highlight last dragged item after drop
	useEffect(() => {
		if (lastAction) triggerPostMoveFlash(lastAction.source.element);
	}, [lastAction]);

	useEffect(() => {
		return combine(
			monitorForElements({
				canMonitor: ({ source }) =>
					source.data.uniqueContextId === uniqueContextId,
				onDragStart({ source }) {
					setDraggedItem(source.data as ItemType<D>);
				},
				onDrop(args) {
					const { location, source } = args;

					setDraggedItem(null);

					// Didn't drop on anything
					if (!location.current.dropTargets.length) return;

					const target = location.current
						.dropTargets[0] as (typeof location.current.dropTargets)[number] & {
						data: ItemType<D>;
					};

					const instruction: Instruction | null = extractInstruction(
						target.data,
					);

					if (instruction !== null) {
						const typedSource = source as typeof source & { data: ItemType<D> };

						setLastAction({
							instruction,
							source: typedSource,
							target,
						});

						onDrop?.({
							instruction,
							source: typedSource,
							target,
						});
					}
				},
			}),
		);
	}, [onDrop, uniqueContextId]);

	const childRenderer = children ?? SampleChildren;

	return childRenderer({
		children: items.map((item, index, array) => {
			const type: ItemMode = (() => {
				if (item.items?.length && item.isOpen) {
					return 'expanded';
				}

				if (index === array.length - 1) {
					return 'last-in-group';
				}

				return 'standard';
			})();

			return (
				<SortableTreeItem<D>
					draggedItem={draggedItem}
					getAllowedDropInstructions={getAllowedDropInstructions}
					indentLevel={0}
					indentSize={indentSize}
					indicatorType={indicatorType}
					item={item}
					key={item.id}
					mode={type}
					getPathToItem={(targetId: ItemType<D>['id']) =>
						getPathToItem<D>({ current: lastStateRef.current, targetId }) ?? []
					}
					onExpandToggle={onExpandToggle}
					renderIndicator={
						(renderIndicator ?? indicatorType === 'ghost')
							? SampleDropGhostIndicator
							: SampleDropLineIndicator
					}
					renderPreview={renderPreview}
					uniqueContextId={uniqueContextId}
				>
					{renderRow}
				</SortableTreeItem>
			);
		}),
		containerRef,
	});
};

export default SortableTree;
