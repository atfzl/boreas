var AST = require('./ast');
var Tokenizer = require('./tokenizer');
var Utilities = require('./utilities');
function beautify(node) {
    var level = 0, prevAst = null, prevRet = null, newline = function () {
        var s = '\n';
        for (var i = 0; i < level; i++)
            s += '\t';
        return s;
    };
    return Utilities.trim(node.walk(function (ast, descend, walker) {
        var ret, token;
        // generic result for nodes with errors
        if ((ast instanceof AST.ASTNode) && ast.hasError())
            ret = ast.errorTokensToString();
        else if (ast instanceof Tokenizer.Token) {
            token = ast.token;
            ret = beautifyToken(ast, prevRet);
            if (token === Tokenizer.EToken.LBRACE) {
                level++;
                ret += newline();
            }
            else if (token === Tokenizer.EToken.RBRACE) {
                level--;
                ret = newline() + ret + newline();
            }
        }
        else if (ast instanceof AST.SelectorCombinator) {
            ret = ast.getToken().token === Tokenizer.EToken.WHITESPACE ?
                ' ' :
                ' ' + ast.getToken().src + ' ';
        }
        else if (ast instanceof AST.SelectorList)
            ret = trailingSpace(join(descend()));
        else if (ast instanceof AST.Declaration) {
            ret = '';
            if (prevAst instanceof AST.Declaration)
                ret += newline();
            ret += join(descend());
        }
        else if (ast instanceof AST.FunctionArgumentValue) {
            ret = Utilities.trim(join(ast.walkChildren(walker))) +
                beautifyToken(ast.getSeparator(), prevRet);
        }
        else if (ast instanceof AST.RuleList) {
            if (ast.getLBrace()) {
                ret = ast.getLBrace().walk(walker) +
                    Utilities.trimRight(join(ast.walkChildren(walker))) +
                    ast.getRBrace().walk(walker);
            }
            else
                ret = join(descend());
        }
        else if (ast instanceof AST.AbstractRule) {
            if ((ast instanceof AST.AtRule) && (ast.getRules() || ast.getDeclarations())) {
                // add a trailing space after the prelude
                ret = ast.getAtKeyword().walk(walker) +
                    trailingSpace(ast.getPrelude().walk(walker));
                // walk the rules/declarations
                if (ast.getRules())
                    ret += ast.getRules().walk(walker);
                else
                    ret += ast.getDeclarations().walk(walker);
            }
            else
                ret = join(descend());
            ret += newline();
        }
        else
            ret = join(descend());
        prevAst = ast;
        prevRet = ret;
        return ret;
    }));
}
exports.beautify = beautify;
function join(arr, sep) {
    if (sep === void 0) { sep = ''; }
    return Array.isArray(arr) ? arr.join(sep) : (arr || '');
}
function leadingSpace(s) {
    return (s[0] === ' ') ? s : ' ' + s;
}
function trailingSpace(s) {
    return (s[s.length - 1] === ' ') ? s : s + ' ';
}
function beautifyTokenComments(triviaToken /*, addSpaces: boolean*/) {
    var s = '', len, i, t;
    if (!triviaToken || triviaToken.length === 0)
        return '';
    // skip trailing whitespaces
    for (len = triviaToken.length; len > 0; len--)
        if (triviaToken[len - 1].token !== Tokenizer.EToken.WHITESPACE)
            break;
    // find the first non-whitespace
    for (i = 0; i < len; i++)
        if (triviaToken[i].token !== Tokenizer.EToken.WHITESPACE)
            break;
    // construct the string
    for (; i < len; i++) {
        t = triviaToken[i];
        s += t.token === Tokenizer.EToken.COMMENT ? t.src : ' ';
    }
    return s && leadingSpace(trailingSpace(s));
}
function beautifyToken(token, prev) {
    var start, end;
    if (!token)
        return '';
    start = beautifyTokenComments(token.leadingTrivia);
    end = beautifyTokenComments(token.trailingTrivia);
    switch (token.token) {
        case Tokenizer.EToken.WHITESPACE:
            if (start[start.length - 1] === ' ') {
                if (end[0] === ' ')
                    return start + end.substr(1);
                return start + end;
            }
            if (end[0] === ' ')
                return start + end;
            return start + ' ' + end;
        case Tokenizer.EToken.AT_KEYWORD:
        case Tokenizer.EToken.COMMA:
            // make sure that there always is a space after a ":" and a ","
            return trailingSpace(start + token.src + end);
        case Tokenizer.EToken.COLON:
            // add a trailing space if this token doesn't occur within a selector
            return start + token.src + end + (AST.hasParent(token, AST.Selector) ? '' : ' ');
        case Tokenizer.EToken.INCLUDE_MATCH:
        case Tokenizer.EToken.DASH_MATCH:
        case Tokenizer.EToken.PREFIX_MATCH:
        case Tokenizer.EToken.SUFFIX_MATCH:
        case Tokenizer.EToken.SUBSTRING_MATCH:
        case Tokenizer.EToken.COLUMN:
            return leadingSpace(trailingSpace(start + token.src + end));
        default:
            return start + token.src + end;
    }
    return '';
}
