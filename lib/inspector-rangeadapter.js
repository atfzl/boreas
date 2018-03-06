var AST = require('./ast');
var Tokenizer = require('./tokenizer');
var NodeNames = require('./nodenames');
var CSSUtilities = require('./utilities');
var RangeAdapter = (function () {
    function RangeAdapter() {
    }
    RangeAdapter.StyleSheet = function (styleSheet) {
        return styleSheet.range;
    };
    /**
     * Creates the range from the first token after the opening curly brace
     * until the last token before the closing curly brace of a declaration list,
     * as expected by the inspector.
     *
     * @param declarations
     * @returns {T.ISourceRange}
     */
    RangeAdapter.DeclarationList = function (declarations) {
        var lenDeclarations = declarations.getLength(), firstRange = declarations.range, lastRange = declarations.range, lbrace = declarations.getLBrace(), rbrace = declarations.getRBrace(), firstTrailing = lbrace && lbrace.trailingTrivia, firstLeading, lastLeading, lastTrailing, tokens, firstToken, lastToken, lenTokens;
        if (firstTrailing && firstTrailing.length > 0)
            firstRange = firstTrailing[0].range;
        else if (lenDeclarations === 0) {
            firstRange = {
                startLine: lbrace.range.endLine,
                startColumn: lbrace.range.endColumn,
                endLine: 0,
                endColumn: 0
            };
        }
        else if (lenDeclarations > 0) {
            tokens = declarations[0].getTokens();
            if (tokens.length > 0) {
                firstToken = tokens[0];
                firstLeading = firstToken.leadingTrivia;
                if (firstLeading && firstLeading.length > 0)
                    firstRange = firstLeading[0].range;
                else
                    firstRange = firstToken.range;
            }
        }
        lastLeading = rbrace && rbrace.leadingTrivia;
        if (lastLeading && lastLeading.length > 0)
            lastRange = lastLeading[lastLeading.length - 1].range;
        else if (lenDeclarations === 0) {
            lastRange = {
                startLine: 0,
                startColumn: 0,
                endLine: rbrace.range.startLine,
                endColumn: rbrace.range.startColumn
            };
        }
        else if (lenDeclarations > 0) {
            tokens = declarations[lenDeclarations - 1].getTokens();
            lenTokens = tokens.length;
            if (lenTokens > 0) {
                lastToken = tokens[lenTokens - 1];
                lastTrailing = lastToken.trailingTrivia;
                if (lastTrailing && lastTrailing.length > 0)
                    lastRange = lastTrailing[lastTrailing.length - 1].range;
                else
                    lastRange = lastToken.range;
            }
        }
        return {
            startLine: firstRange.startLine,
            startColumn: firstRange.startColumn,
            endLine: lastRange.endLine,
            endColumn: lastRange.endColumn
        };
    };
    /**
     * Returns the range of the token "token" excluding any leading and trailing trivia.
     *
     * @param token
     * @returns {T.ISourceRange}
     */
    RangeAdapter.Token = function (token) {
        return getNoTriviaRange(token);
    };
    /**
     * Returns the range excluding any leading and trailing trivia.
     *
     * @param node
     * @returns {T.ISourceRange}
     */
    RangeAdapter.default = function (node) {
        return getNoTriviaRange(node) || node.range;
    };
    return RangeAdapter;
})();
/**
 * Finds the range from "start" to "end", excluding any leading or trailing trivia.
 *
 * @param start
 * @param end
 * @returns {T.ISourceRange}
 */
function getNoTriviaRange(start, end) {
    if (end === void 0) { end = start; }
    var firstToken = (start instanceof Tokenizer.Token) ? start : start.getFirstToken(), lastToken = (end instanceof Tokenizer.Token) ? end : end.getLastToken(), range, r;
    if (!firstToken && !lastToken)
        return null;
    range = {
        startLine: start.range.startLine,
        startColumn: start.range.startColumn,
        endLine: end.range.endLine,
        endColumn: end.range.endColumn
    };
    if (firstToken) {
        if (firstToken.leadingTrivia && firstToken.leadingTrivia.length > 0) {
            // get the end of the leading trivia
            r = firstToken.leadingTrivia[firstToken.leadingTrivia.length - 1].range;
            range.startLine = r.endLine;
            range.startColumn = r.endColumn;
        }
        else {
            range.startLine = firstToken.range.startLine;
            range.startColumn = firstToken.range.startColumn;
        }
    }
    if (lastToken) {
        if (lastToken.trailingTrivia && lastToken.trailingTrivia.length > 0) {
            // get the start of the trailing trivia
            r = lastToken.trailingTrivia[0].range;
            range.endLine = r.startLine;
            range.endColumn = r.startColumn;
        }
        else {
            range.endLine = lastToken.range.endLine;
            range.endColumn = lastToken.range.endColumn;
        }
    }
    return range;
}
exports.getNoTriviaRange = getNoTriviaRange;
/**
 *
 * @param node
 * @returns {T.ISourceRange}
 */
function getRange(node) {
    var adapter = RangeAdapter[NodeNames.getNodeName(node)];
    return adapter ?
        adapter(node) :
        (node instanceof AST.ASTNode) ? RangeAdapter.default(node) : node.range;
}
exports.getRange = getRange;
/**
 *
 * @param node
 * @param range
 * @returns {string}
 */
function getText(node, range) {
    return CSSUtilities.getTextFromRange(node.toString(), CSSUtilities.relativeRange(range, node.range));
}
exports.getText = getText;
