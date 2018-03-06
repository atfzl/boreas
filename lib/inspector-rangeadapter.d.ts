import T = require('./types');
/**
 * Finds the range from "start" to "end", excluding any leading or trailing trivia.
 *
 * @param start
 * @param end
 * @returns {T.ISourceRange}
 */
export declare function getNoTriviaRange(start: T.INode, end?: T.INode): T.ISourceRange;
/**
 *
 * @param node
 * @returns {T.ISourceRange}
 */
export declare function getRange(node: T.INode): T.ISourceRange;
/**
 *
 * @param node
 * @param range
 * @returns {string}
 */
export declare function getText(node: T.INode, range: T.ISourceRange): string;
