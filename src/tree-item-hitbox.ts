/**
 * A clone of https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/hitbox/src/tree-item.ts
 * with some changes to allow for custom controls over items where make-child is not allowed.
 *
 * Once https://github.com/atlassian/pragmatic-drag-and-drop/issues/49 is resolved, this can be removed
 * and the official library can be used instead.
 */

import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';

export type ItemMode = 'standard' | 'expanded' | 'last-in-group';

export type Instruction =
	| {
			type: 'reorder-above';
			currentLevel: number;
			indentSize: number;
	  }
	| {
			type: 'reorder-below';
			currentLevel: number;
			indentSize: number;
	  }
	| {
			type: 'make-child';
			currentLevel: number;
			indentSize: number;
	  }
	| {
			// Used when the last item in a group needs to be moved down a level
			// without changing its order global order
			type: 'reparent';
			currentLevel: number;
			indentSize: number;
			desiredLevel: number;
	  }
	| {
			type: 'instruction-blocked';
			desired: Exclude<Instruction, { type: 'instruction-blocked' }>;
	  };

// Using a symbol so we can guarantee a key with a unique value
const uniqueKey = Symbol('tree-item-instruction');

function getCenter(rect: DOMRect): Position {
	return {
		x: (rect.right + rect.left) / 2,
		y: (rect.bottom + rect.top) / 2,
	};
}

function standardHitbox({
	allowedInstructions,
	client,
	borderBox,
}: {
	allowedInstructions: Array<Instruction['type']>;
	client: Position;
	borderBox: DOMRect;
}): 'reorder-above' | 'reorder-below' | 'make-child' {
	// If `make-child` is allowed, split the borderBox into quarters, otherwise
	// split it in half.
	const segments = allowedInstructions.includes('make-child') ? 4 : 2;
	const falloverHeight = borderBox.height / segments;

	// If dragging over the the top segment: reorder-above
	if (client.y <= borderBox.top + falloverHeight) {
		return 'reorder-above';
	}

	// If dragging over the bottom segment: reorder-below
	if (client.y >= borderBox.bottom - falloverHeight) {
		return 'reorder-below';
	}

	return 'make-child';
}

export function getInstruction({
	allowedInstructions,
	element,
	input,
	currentLevel,
	indentSize,
	mode,
}: {
	allowedInstructions: Array<Instruction['type']>;
	element: Element;
	input: Input;
	currentLevel: number;
	indentSize: number;
	mode: ItemMode;
}): Instruction {
	const client: Position = {
		x: input.clientX,
		y: input.clientY,
	};

	const borderBox = element.getBoundingClientRect();
	if (mode === 'standard') {
		const type = standardHitbox({ allowedInstructions, borderBox, client });
		return { currentLevel, indentSize, type };
	}
	const center: Position = getCenter(borderBox);

	if (mode === 'expanded') {
		// leveraging "standard" hitbox to ensure that the 'reorder-above' hit zone is
		// exactly the same for "standard" and "expanded" items
		const type = standardHitbox({ allowedInstructions, borderBox, client });
		return {
			currentLevel,
			indentSize,
			// Use the "standard" hitbox for "reorder above",
			// The rest of the item is "make-child"
			type: type === 'reorder-above' ? type : 'make-child',
		};
	}

	// `mode` is "last-in-group"

	const visibleInset = indentSize * currentLevel;

	// Before the left edge of the visible item
	if (client.x < borderBox.left + visibleInset) {
		// Above the center: `reorder-above`
		if (client.y < center.y) {
			return { currentLevel, indentSize, type: 'reorder-above' };
		}

		// On or below the center: `reparent`
		// On the center = `reparent` as we are giving a slightly bigger hitbox to this
		// action as it is the only place a user can do it
		const rawLevel = (client.x - borderBox.left) / indentSize;

		// We can get sub pixel negative numbers as getBoundingClientRect gives sub-pixel accuracy,
		// where as clientX is rounded to the nearest pixel.
		// Using Math.max() ensures we can never get a negative level
		const desiredLevel = Math.max(Math.floor(rawLevel), 0);

		return {
			currentLevel,
			desiredLevel,
			indentSize,
			type: 'reparent',
		};
	}

	// On the visible item
	return {
		currentLevel,
		indentSize,
		type: standardHitbox({ allowedInstructions, borderBox, client }),
	};
}

function isShallowEqual(
	a: Record<string, unknown>,
	b: Record<string, unknown>,
): boolean {
	const aKeys = Object.keys(a).sort();
	const bKeys = Object.keys(b).sort();
	if (aKeys.length !== bKeys.length) return false;
	return aKeys.every((key) => a[key] === b[key]);
}

function areInstructionsEqual(a: Instruction, b: Instruction): boolean {
	// Shortcut
	if (a.type !== b.type) {
		return false;
	}
	if (a.type === 'instruction-blocked' && b.type === 'instruction-blocked') {
		return areInstructionsEqual(a.desired, b.desired);
	}
	return isShallowEqual(a, b);
}

// Note: not using `memoize-one` as all we need is a cached value.
// We do not need to avoid executing an expensive function.
const memoizeInstruction = (() => {
	let last: Instruction | null = null;

	return (instruction: Instruction): Instruction => {
		if (last && areInstructionsEqual(last, instruction)) {
			return last;
		}
		last = instruction;
		return instruction;
	};
})();

export function applyInstructionBlock({
	allowedInstructions,
	desired,
}: {
	allowedInstructions: Array<Instruction['type']>;
	desired: Instruction;
}): Instruction {
	if (
		desired.type === 'make-child' &&
		allowedInstructions.includes('reorder-below')
	)
		return {
			...desired,
			type: 'reorder-below',
		};

	return {
		// @ts-expect-error TODO: Fix me
		desired,
		type: 'instruction-blocked',
	};
}

export function attachInstruction(
	userData: Record<string | symbol, unknown>,
	instruction: Instruction,
): Record<string | symbol, unknown> {
	return {
		...userData,
		[uniqueKey]: memoizeInstruction(instruction),
	};
}

export function extractInstruction(
	userData: Record<string | symbol, unknown>,
): Instruction | null {
	return (userData[uniqueKey] as Instruction) ?? null;
}
