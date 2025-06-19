import type { ItemType } from 'pragmatic-drag-and-drop-tree';

export type DataType = {
	name: string;
	type: 'category' | 'thing';
};

export type IdType = string;

export const SAMPLE_TREE_DATA: Array<ItemType<IdType, DataType>> = [
	{
		data: { name: 'Cars', type: 'category' },
		id: 'cars',
		isExpandable: true,
		items: [
			{
				data: { name: 'Japanese', type: 'category' },
				id: 'japanese',
				items: [
					{
						data: { name: 'Honda', type: 'thing' },
						id: 'honda',
					},
				],
			},
			{
				data: { name: 'American', type: 'category' },
				id: 'american',
				items: [
					{
						data: { name: 'Tesla', type: 'thing' },
						id: 'tesla',
					},
				],
			},
			{
				data: { name: 'European', type: 'category' },
				id: 'european',
				items: [
					{
						data: { name: 'Ferarri', type: 'thing' },
						id: 'ferarri',
					},
				],
			},
		],
	},
	{
		data: { name: 'Fruits', type: 'category' },
		id: 'fruits',
		isExpandable: true,
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
