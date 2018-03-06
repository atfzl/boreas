// ==================================================================
// IMPORT MODULES
// ==================================================================
var AST = require('./ast');
var Tokenizer = require('./tokenizer');
var _hasTrim = typeof String.prototype.trim === 'function';
function trim(s) {
    if (_hasTrim)
        return s.trim();
    return s.replace(/^\s+|\s+$/g, '');
}
exports.trim = trim;
function trimLeft(s) {
    return s.replace(/^\s+/, '');
}
exports.trimLeft = trimLeft;
function trimRight(s) {
    return s.replace(/\s+$/, '');
}
exports.trimRight = trimRight;
function getLineStartIndices(text) {
    var lineStartIndices = [];
    var len = text.length;
    for (var i = 0; i < len; i++) {
        var c = text[i];
        if (c === '\r' || c === '\n')
            lineStartIndices.push(i + 1);
        // skip a '\n' following a '\r0'
        if (i < len - 1 && c === '\r' && text[i + 1] === '\n') {
            lineStartIndices[lineStartIndices.length - 1]++;
            i++;
        }
    }
    return lineStartIndices;
}
exports.getLineStartIndices = getLineStartIndices;
function getLineNumberFromPosition(pos, lineStartIndices) {
    for (var i = lineStartIndices.length - 1; i >= 0; i--)
        if (pos >= lineStartIndices[i])
            return i + 1;
    return 0;
}
exports.getLineNumberFromPosition = getLineNumberFromPosition;
function getColumnNumberFromPosition(pos, lineStartIndices) {
    for (var i = lineStartIndices.length - 1; i >= 0; i--) {
        var startIdx = lineStartIndices[i];
        if (pos >= startIdx)
            return pos - startIdx;
    }
    return pos;
}
exports.getColumnNumberFromPosition = getColumnNumberFromPosition;
function getIndexFromLineColumn(lineNumber, columnNumber, lineStartIndices) {
    if (lineNumber === 0)
        return columnNumber;
    if (lineNumber > lineStartIndices.length)
        return -1;
    return lineStartIndices[lineNumber - 1] + columnNumber;
}
exports.getIndexFromLineColumn = getIndexFromLineColumn;
function copyRange(src, dst) {
    if (!src || !dst || !src.range || !dst.range)
        return;
    dst.range.startLine = src.range.startLine;
    dst.range.startColumn = src.range.startColumn;
    dst.range.endLine = src.range.endLine;
    dst.range.endColumn = src.range.endColumn;
}
exports.copyRange = copyRange;
/**
 * Inserts "insertRange" into "range" and updates its start/end lines/columns.
 *
 * @param range The range to update
 * @param insertRange The range to insert into "range"
 */
function insertRange(range, insertRange) {
    if (!range || !insertRange)
        return;
    var lineOffset = insertRange.endLine - insertRange.startLine;
    var columnOffset = insertRange.endColumn - insertRange.startColumn;
    var oldStartLine = range.startLine;
    var oldStartColumn = range.startColumn;
    var oldEndLine = range.endLine;
    var oldEndColumn = range.endColumn;
    if (oldStartLine === insertRange.startLine && oldStartColumn >= insertRange.startColumn) {
        range.startLine += lineOffset;
        range.startColumn += columnOffset;
    }
    else if (oldStartLine > insertRange.startLine)
        range.startLine += lineOffset;
    if (oldEndLine === insertRange.startLine && oldEndColumn > insertRange.startColumn) {
        range.endLine += lineOffset;
        range.endColumn += columnOffset;
    }
    else if (oldEndLine > insertRange.startLine)
        range.endLine += lineOffset;
}
exports.insertRange = insertRange;
/**
 * Deletes "deleteRange" from "range" and updates its start/end lines/columns.
 *
 * @param range The range to update
 * @param deleteRange The range to remove from "range"
 */
function deleteRange(range, deleteRange) {
    if (!range || !deleteRange)
        return;
    var lineSpan = deleteRange.endLine - deleteRange.startLine;
    var oldStartLine = range.startLine;
    var oldStartColumn = range.startColumn;
    var oldEndLine = range.endLine;
    var oldEndColumn = range.endColumn;
    // delete range entirely before range
    if (deleteRange.endLine < oldStartLine || (deleteRange.endLine === oldStartLine && deleteRange.endColumn < oldStartColumn)) {
        range.startLine -= lineSpan;
        range.endLine -= lineSpan;
        if (deleteRange.endLine === oldStartLine) {
            var columnSpan = deleteRange.endColumn - deleteRange.startColumn;
            range.startColumn -= columnSpan;
            // adjust end column if the range is on a single line
            if (oldStartLine === oldEndLine)
                range.endColumn -= columnSpan;
        }
        return;
    }
    // delete range entirely after range
    if (deleteRange.startLine > oldEndLine || (deleteRange.startLine === oldEndLine && deleteRange.startColumn > oldEndColumn)) {
        // nothing to do...
        return;
    }
    // delete range intersects range
    // compute new start and end lines
    range.startLine = Math.min(deleteRange.startLine, oldStartLine);
    range.endLine = oldEndLine < deleteRange.endLine ? deleteRange.startLine : Math.max(range.startLine, oldEndLine - lineSpan);
    // compute new start column
    if (oldStartLine === deleteRange.startLine)
        range.startColumn = Math.min(deleteRange.startColumn, oldStartColumn);
    else if (oldStartLine > deleteRange.startLine)
        range.startColumn = deleteRange.startColumn;
    // compute new end column
    if (oldEndLine === deleteRange.endLine)
        range.endColumn = Math.max(deleteRange.startColumn, oldEndColumn + deleteRange.startColumn - deleteRange.endColumn);
    else if (oldEndLine < deleteRange.endLine) {
        // delete range ends after the range
        range.endColumn = deleteRange.startColumn;
    }
}
exports.deleteRange = deleteRange;
/**
 * Updates the ranges of all the nodes following "nodeModified".
 *
 * @param ast
 * @param nodeModified
 * @param offset
 */
function insertRangeFromNode(ast, nodeModified, offset) {
    if (!ast || !nodeModified)
        return;
    var range = offset === undefined ? nodeModified.range : offset;
    var sl = range.startLine;
    var sc = range.startColumn;
    var el = range.endLine;
    var ec = range.endColumn;
    var updateRecursive = function (node) {
        if (node !== nodeModified) {
            // update ancestor nodes containing "nodeModified"
            if (node.isAncestorOf(nodeModified)) {
                var sl0 = node.range.startLine;
                var sc0 = node.range.startColumn;
                insertRange(node.range, range);
                if (sl0 === sl && sc0 === sc) {
                    node.range.startLine = sl0;
                    node.range.startColumn = sc0;
                }
                node.range.startLine = Math.min(node.range.startLine, sl);
                if (node.range.startLine === sl)
                    node.range.startColumn = Math.min(node.range.startColumn, sc);
                node.range.endLine = Math.max(node.range.endLine, el);
                if (node.range.endLine === el)
                    node.range.endColumn = Math.max(node.range.endColumn, ec);
            }
            else
                insertRange(node.range, range);
            // recursively update the children
            var children = node.getChildren();
            var len = children.length;
            for (var i = 0; i < len; i++)
                updateRecursive(children[i]);
        }
        else if (offset !== undefined) {
            // if there is an offset to "nodeModified", incorporate this offset
            insertRange(node.range, range);
            node.range.endLine = Math.max(node.range.endLine, el);
            if (node.range.endLine === el)
                node.range.endColumn = Math.max(node.range.endColumn, ec);
        }
    };
    // console.log('Inserting range from node ', nodeModified.toJSON());
    updateRecursive(ast);
}
exports.insertRangeFromNode = insertRangeFromNode;
function zeroRange(ast, nodeModifiedOrRange) {
    if (!ast)
        return;
    var r, range;
    var updateRecursive = function (node) {
        deleteRange(node.range, range);
        // recursively update the children
        var children = node.getChildren();
        var len = children.length;
        for (var i = 0; i < len; i++)
            updateRecursive(children[i]);
    };
    if ((nodeModifiedOrRange instanceof AST.ASTNode) || (nodeModifiedOrRange instanceof Tokenizer.Token)) {
        r = nodeModifiedOrRange.range;
        range = new AST.SourceRange(r.startLine, r.startColumn, r.endLine, r.endColumn);
    }
    else if (nodeModifiedOrRange.startLine !== undefined && nodeModifiedOrRange.startColumn !== undefined &&
        nodeModifiedOrRange.endLine !== undefined && nodeModifiedOrRange.endColumn !== undefined) {
        range = new AST.SourceRange(nodeModifiedOrRange.startLine, nodeModifiedOrRange.startColumn, nodeModifiedOrRange.endLine, nodeModifiedOrRange.endColumn);
    }
    else
        return;
    // console.log('Zeroing range of ', nodeModified.toJSON());
    // console.log('Before zeroing:', ast.toJSON());
    updateRecursive(ast);
    // console.log('==>', ast.toJSON());
}
exports.zeroRange = zeroRange;
function updateNodeRange(ast, nodeModified, newRange) {
    if (!nodeModified)
        return;
    zeroRange(ast, nodeModified);
    nodeModified.range = newRange;
    insertRangeFromNode(ast, nodeModified);
}
exports.updateNodeRange = updateNodeRange;
function getRangeDifference(oldText, newText, oldRange) {
    var oldTextStartIndices = getLineStartIndices(oldText);
    var newTextStartIndices = getLineStartIndices(newText);
    var oldEndLine = getLineNumberFromPosition(oldText.length, oldTextStartIndices);
    var oldEndColumn = getColumnNumberFromPosition(oldText.length, oldTextStartIndices);
    var newEndLine = getLineNumberFromPosition(newText.length, newTextStartIndices);
    var newEndColumn = getColumnNumberFromPosition(newText.length, newTextStartIndices);
    return new AST.SourceRange(oldRange.startLine, oldRange.startColumn, oldRange.endLine + newEndLine - oldEndLine, newEndLine === oldEndLine ? oldRange.endColumn + newEndColumn - oldEndColumn : newEndColumn);
}
exports.getRangeDifference = getRangeDifference;
function offsetRange(ast, lineOffset, columnOffset) {
    if (!ast || !ast.range)
        return;
    var startLine = ast.range.startLine;
    var offsetRecursive = function (node /* , updateTrivia: boolean*/) {
        var children = node.getChildren(), len = children.length, i;
        // only offset the columns if the node starts/ends on the same line as the top node
        if (node.range.startLine === startLine)
            node.range.startColumn += columnOffset;
        if (node.range.endLine === startLine)
            node.range.endColumn += columnOffset;
        // offset the lines
        node.range.startLine += lineOffset;
        node.range.endLine += lineOffset;
        // update children
        for (i = 0; i < len; i++)
            offsetRecursive(children[i]);
        /*
        // update trivia
        if (updateTrivia && (node instanceof Tokenizer.Token))
        {
            if ((<Tokenizer.Token> node).leadingTrivia)
            {
                lenTrivia = (<Tokenizer.Token> node).leadingTrivia.length;
                for (j = 0; j < lenTrivia; j++)
                    offsetRecursive((<Tokenizer.Token> node).leadingTrivia[j], false);
            }

            if ((<Tokenizer.Token> node).trailingTrivia)
            {
                lenTrivia = (<Tokenizer.Token> node).trailingTrivia.length;
                for (j = 0; j < lenTrivia; j++)
                    offsetRecursive((<Tokenizer.Token> node).trailingTrivia[j], false);
            }
        }*/
    };
    if (lineOffset !== 0 || columnOffset !== 0)
        offsetRecursive(ast);
}
exports.offsetRange = offsetRange;
function getTextFromRange(text, range) {
    var lineStartIndices = getLineStartIndices(text);
    var start = getIndexFromLineColumn(range.startLine, range.startColumn, lineStartIndices);
    var end = getIndexFromLineColumn(range.endLine, range.endColumn, lineStartIndices);
    return text.substring(start, end);
}
exports.getTextFromRange = getTextFromRange;
function replaceTextInRange(text, range, replacement) {
    var lineStartIndices = getLineStartIndices(text);
    var start = getIndexFromLineColumn(range.startLine, range.startColumn, lineStartIndices);
    var end = getIndexFromLineColumn(range.endLine, range.endColumn, lineStartIndices);
    return text.substr(0, start) + replacement + text.substr(end);
}
exports.replaceTextInRange = replaceTextInRange;
/**
 * Computes the range "source" relative to "target".
 *
 * @param source
 * @param target
 * @returns {T.ISourceRange}
 */
function relativeRange(source, target) {
    return {
        startLine: source.startLine - target.startLine,
        startColumn: source.startLine === target.startLine ? source.startColumn - target.startColumn : source.startColumn,
        endLine: source.endLine - target.startLine,
        endColumn: source.endLine === target.startLine ? source.endColumn - target.startColumn : source.endColumn
    };
}
exports.relativeRange = relativeRange;
