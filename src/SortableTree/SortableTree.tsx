import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useMemo, useRef, useState } from 'react';
import SortableTreeItem from '../SortableTreeItem/SortableTreeItem';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import { extractInstruction } from '../tree-item-hitbox';
import type {
	DataType,
	DropPayloadType,
	IdType,
	ItemType,
	PropsType,
} from '../types';
import { getPathToItem } from '../utilities';

const defaultGetAllowedDropInstructions = () => [
	'reorder-above' as const,
	'reorder-below' as const,
	'make-child' as const,
	'reparent' as const,
];

// TODO: Find a better way to handle empty renderers
const NOOP = () => <div />;

const SortableTree = <ID extends IdType, D extends DataType>({
	children,
	flashClass,
	getAllowedDropInstructions = defaultGetAllowedDropInstructions,
	indentSize = 16,
	indicatorType = 'line',
	items,
	onDrop,
	onExpandToggle,
	renderIndicator,
	renderPreview,
	renderRow,
}: PropsType<ID, D>) => {
	const [lastAction, setLastAction] = useState<DropPayloadType<ID, D> | null>(
		null,
	);
	const [draggedItem, setDraggedItem] = useState<ItemType<ID, D> | null>(null);

	const containerRef = useRef<HTMLElement | null>(null);
	const lastStateRef = useRef<typeof items>(items);

	const uniqueContextId = useMemo(() => Symbol('unique-id'), []);

	useEffect(() => {
		lastStateRef.current = items;
	}, [items]);

	// Highlight last dragged item after drop. This is essentially a clone of
	// the `triggerPostMoveFlash` function from the `pragmatic-drag-and-drop`
	// library.
	useEffect(() => {
		let raf: number | null = null;
		if (lastAction && flashClass) {
			raf = requestAnimationFrame(() => {
				lastAction.source.element.classList.add(flashClass);
			});
		}

		return () => {
			if (lastAction && flashClass)
				lastAction.source.element.classList.remove(flashClass);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [flashClass, lastAction]);

	useEffect(() => {
		return combine(
			monitorForElements({
				canMonitor: ({ source }) =>
					source.data.uniqueContextId === uniqueContextId,
				onDragStart({ source }) {
					setDraggedItem(source.data as ItemType<ID, D>);
				},
				onDrop(args) {
					const { location, source } = args;

					setDraggedItem(null);

					// Didn't drop on anything
					if (!location.current.dropTargets.length) return;

					const target = location.current
						.dropTargets[0] as (typeof location.current.dropTargets)[number] & {
						data: ItemType<ID, D>;
					};

					const instruction: Instruction | null = extractInstruction(
						target.data,
					);

					if (instruction !== null) {
						const typedSource = source as typeof source & {
							data: ItemType<ID, D>;
						};

						setLastAction({
							instruction,
							source: typedSource,
							target,
						});

						// Don't fire onDrop for `instruction-blocked`
						if (instruction.type === 'instruction-blocked') return;

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

	const childRenderer = children ?? (() => null);

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
				<SortableTreeItem<ID, D>
					draggedItem={draggedItem}
					getAllowedDropInstructions={getAllowedDropInstructions}
					getPathToItem={(targetId: ItemType<ID, D>['id']) =>
						getPathToItem<ID, D>({ current: lastStateRef.current, targetId }) ??
						[]
					}
					indentLevel={0}
					indentSize={indentSize}
					indicatorType={indicatorType}
					item={item}
					key={item.id}
					mode={type}
					onExpandToggle={onExpandToggle}
					renderIndicator={renderIndicator ?? NOOP}
					renderPreview={renderPreview ?? NOOP}
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
