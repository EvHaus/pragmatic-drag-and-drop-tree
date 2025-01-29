import type { ItemType } from 'pragmatic-drag-and-drop-tree';

export type DataType = {
	name: string;
	type: 'category' | 'thing';
};

export const SAMPLE_TREE_DATA: Array<ItemType<DataType>> = [
	{
		data: { name: 'Cars', type: 'category' },
		id: 'cars',
		items: [
			{
				data: { name: 'Honda', type: 'thing' },
				id: 'honda',
			},
			{
				data: { name: 'Tesla', type: 'thing' },
				id: 'tesla',
			},
			{
				data: { name: 'Ferarri', type: 'thing' },
				id: 'ferarri',
			},
		],
	},
	{
		data: { name: 'Fruits', type: 'category' },
		id: 'fruits',
		items: [
			{
				data: { name: 'Apple', type: 'thing' },
				id: 'apple',
			},
			{
				data: { name: 'Banana', type: 'thing' },
				id: 'banana',
			},
			{
				data: { name: 'Grapes', type: 'thing' },
				id: 'grapes',
			},
		],
	},
	{
		data: { name: 'Vegetables', type: 'category' },
		id: 'vegetables',
	},
];
