const INDENT_SIZE = 12;

export const getIndentSize = (indent: number, isSingleSection?: boolean) => {
	let updatedIndent = indent;
	if (isSingleSection) updatedIndent = indent - 1;
	return updatedIndent > 0 ? updatedIndent * INDENT_SIZE : 0;
};
