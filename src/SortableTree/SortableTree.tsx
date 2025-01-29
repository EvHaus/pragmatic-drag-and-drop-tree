import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { extractInstruction } from '../tree-item-hitbox';
import type { Instruction, ItemMode } from '../tree-item-hitbox';
import type { DataType, DropPayloadType, ItemType, PropsType } from '../types';
import DefaultChildren from './DefaultChildren';
import styles from './SortableTree.module.css';
import {
	SortableTreeContext,
	type SortableTreeContextValue,
} from './SortableTreeContext';
import SortableTreeItem from './SortableTreeItem';
import { findInTree } from './utilities';

const getPathToItem = ({
	current,
	targetId,
	parentIds = [],
}: {
	current: Array<ItemType>;
	targetId: ItemType['id'];
	parentIds?: Array<ItemType['id']>;
}): Array<ItemType['id']> | undefined => {
	for (const item of current) {
		if (item.id === targetId) {
			return parentIds;
		}
		const nested = getPathToItem({
			current: item.items || [],
			targetId: targetId,
			parentIds: [...parentIds, item.id],
		});
		if (nested) {
			return nested;
		}
	}
};

const SortableTree = <D extends DataType>({
	children = DefaultChildren,
	isFirstLevelHidden = false,
	items,
	onDrop,
	onExpandToggle,
}: PropsType<D>) => {
	const [lastAction, setLastAction] = useState<DropPayloadType<D> | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const lastStateRef = useRef<typeof items>(items);
	useEffect(() => {
		lastStateRef.current = items;
	}, [items]);

	// Highlight last dragged item after drop
	useEffect(() => {
		if (lastAction) triggerPostMoveFlash(lastAction.source.element);
	}, [lastAction]);

	/**
	 * Returns the items that the item with `itemId` can be moved to.
	 *
	 * Uses a depth-first search (DFS) to compile a list of possible targets.
	 */
	const getMoveTargets = useCallback(({ itemId }: { itemId: string }) => {
		const items = lastStateRef.current;

		const targets = [];

		const searchStack = Array.from(items);
		while (searchStack.length > 0) {
			const node = searchStack.pop();

			if (!node) continue;

			/**
			 * If the current node is the item we want to move, then it is not a valid
			 * move target and neither are its children.
			 */
			if (node.id === itemId) continue;

			targets.push(node);

			if (node.items) {
				for (const childNode of node.items) {
					searchStack.push(childNode);
				}
			}
		}

		return targets;
	}, []);

	const getChildrenOfItem = useCallback((itemId: string) => {
		const items = lastStateRef.current;

		/**
		 * An empty string is representing the root
		 */
		if (itemId === '') return items;

		const item = findInTree(items, itemId);
		return item?.items || [];
	}, []);

	const context = useMemo<SortableTreeContextValue<D>>(
		() => ({
			uniqueContextId: Symbol('unique-id'),
			// memoizing this function as it is called by all tree items repeatedly
			// An ideal refactor would be to update our data shape
			// to allow quick lookups of parents
			getPathToItem: (targetId: ItemType['id']) =>
				getPathToItem({ current: lastStateRef.current, targetId }) ?? [],
			// @ts-expect-error FIX ME
			getMoveTargets,
			// @ts-expect-error FIX ME
			getChildrenOfItem,
		}),
		[getChildrenOfItem, getMoveTargets],
	);

	useEffect(() => {
		return combine(
			monitorForElements({
				canMonitor: ({ source }) =>
					source.data.uniqueContextId === context.uniqueContextId,
				onDrop(args) {
					const { location, source } = args;

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
						setLastAction({
							instruction,
							source,
							target,
						});

						onDrop?.({
							instruction,
							source,
							target,
						});
					}
				},
			}),
		);
	}, [context, onDrop]);

	return (
		<SortableTreeContext.Provider value={context}>
			<section className={styles.main} ref={ref}>
				{items.map((item, index, array) => {
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
							index={index}
							isFirstLevelHidden={isFirstLevelHidden}
							item={item}
							key={item.id}
							level={0}
							mode={type}
							onExpandToggle={onExpandToggle}
						>
							{children}
						</SortableTreeItem>
					);
				})}
			</section>
		</SortableTreeContext.Provider>
	);
};

export default SortableTree;
