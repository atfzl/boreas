import T = require('./types');
export declare function trim(s: string): string;
export declare function trimLeft(s: string): string;
export declare function trimRight(s: string): string;
export declare function getLineStartIndices(text: string): number[];
export declare function getLineNumberFromPosition(pos: number, lineStartIndices: number[]): number;
export declare function getColumnNumberFromPosition(pos: number, lineStartIndices: number[]): number;
export declare function getIndexFromLineColumn(lineNumber: number, columnNumber: number, lineStartIndices: number[]): number;
export declare function copyRange(src: T.INode, dst: T.INode): void;
/**
 * Inserts "insertRange" into "range" and updates its start/end lines/columns.
 *
 * @param range The range to update
 * @param insertRange The range to insert into "range"
 */
export declare function insertRange(range: T.ISourceRange, insertRange: T.ISourceRange): void;
/**
 * Deletes "deleteRange" from "range" and updates its start/end lines/columns.
 *
 * @param range The range to update
 * @param deleteRange The range to remove from "range"
 */
export declare function deleteRange(range: T.ISourceRange, deleteRange: T.ISourceRange): void;
/**
 * Updates the ranges of all the nodes following "nodeModified".
 *
 * @param ast
 * @param nodeModified
 * @param offset
 */
export declare function insertRangeFromNode(ast: T.INode, nodeModified: T.INode, offset?: T.ISourceRange): void;
export declare function zeroRange(ast: T.INode, nodeModifiedOrRange: any): void;
export declare function updateNodeRange(ast: T.INode, nodeModified: T.INode, newRange: T.ISourceRange): void;
export declare function getRangeDifference(oldText: string, newText: string, oldRange: T.ISourceRange): T.ISourceRange;
export declare function offsetRange(ast: T.INode, lineOffset: number, columnOffset: number): void;
export declare function getTextFromRange(text: string, range: T.ISourceRange): string;
export declare function replaceTextInRange(text: string, range: T.ISourceRange, replacement: string): string;
/**
 * Computes the range "source" relative to "target".
 *
 * @param source
 * @param target
 * @returns {T.ISourceRange}
 */
export declare function relativeRange(source: T.ISourceRange, target: T.ISourceRange): T.ISourceRange;
