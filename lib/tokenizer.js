// ==================================================================
// IMPORT MODULES
// ==================================================================
(function (EToken) {
    EToken[EToken["IDENT"] = 0] = "IDENT";
    EToken[EToken["FUNCTION"] = 1] = "FUNCTION";
    EToken[EToken["AT_KEYWORD"] = 2] = "AT_KEYWORD";
    EToken[EToken["HASH"] = 3] = "HASH";
    EToken[EToken["STRING"] = 4] = "STRING";
    EToken[EToken["BAD_STRING"] = 5] = "BAD_STRING";
    EToken[EToken["URL"] = 6] = "URL";
    EToken[EToken["BAD_URL"] = 7] = "BAD_URL";
    EToken[EToken["DELIM"] = 8] = "DELIM";
    EToken[EToken["NUMBER"] = 9] = "NUMBER";
    EToken[EToken["PERCENTAGE"] = 10] = "PERCENTAGE";
    EToken[EToken["DIMENSION"] = 11] = "DIMENSION";
    EToken[EToken["UNICODE_RANGE"] = 12] = "UNICODE_RANGE";
    EToken[EToken["INCLUDE_MATCH"] = 13] = "INCLUDE_MATCH";
    EToken[EToken["DASH_MATCH"] = 14] = "DASH_MATCH";
    EToken[EToken["PREFIX_MATCH"] = 15] = "PREFIX_MATCH";
    EToken[EToken["SUFFIX_MATCH"] = 16] = "SUFFIX_MATCH";
    EToken[EToken["SUBSTRING_MATCH"] = 17] = "SUBSTRING_MATCH";
    EToken[EToken["COLUMN"] = 18] = "COLUMN";
    EToken[EToken["WHITESPACE"] = 19] = "WHITESPACE";
    EToken[EToken["COMMENT"] = 20] = "COMMENT";
    EToken[EToken["CDO"] = 21] = "CDO";
    EToken[EToken["CDC"] = 22] = "CDC";
    EToken[EToken["COLON"] = 23] = "COLON";
    EToken[EToken["SEMICOLON"] = 24] = "SEMICOLON";
    EToken[EToken["COMMA"] = 25] = "COMMA";
    EToken[EToken["LBRACKET"] = 26] = "LBRACKET";
    EToken[EToken["RBRACKET"] = 27] = "RBRACKET";
    EToken[EToken["LPAREN"] = 28] = "LPAREN";
    EToken[EToken["RPAREN"] = 29] = "RPAREN";
    EToken[EToken["LBRACE"] = 30] = "LBRACE";
    EToken[EToken["RBRACE"] = 31] = "RBRACE";
    EToken[EToken["LCOMMENT"] = 32] = "LCOMMENT";
    EToken[EToken["RCOMMENT"] = 33] = "RCOMMENT";
    EToken[EToken["EOF"] = 34] = "EOF";
})(exports.EToken || (exports.EToken = {}));
var EToken = exports.EToken;
var EChar;
(function (EChar) {
    EChar[EChar["TAB"] = 9] = "TAB";
    EChar[EChar["LF"] = 10] = "LF";
    EChar[EChar["VTAB"] = 11] = "VTAB";
    EChar[EChar["FF"] = 12] = "FF";
    EChar[EChar["CR"] = 13] = "CR";
    EChar[EChar["SPACE"] = 32] = "SPACE";
    EChar[EChar["QUOT"] = 34] = "QUOT";
    EChar[EChar["HASH"] = 35] = "HASH";
    EChar[EChar["DOLLAR"] = 36] = "DOLLAR";
    EChar[EChar["PERCENTAGE"] = 37] = "PERCENTAGE";
    EChar[EChar["APOS"] = 39] = "APOS";
    EChar[EChar["LPAREN"] = 40] = "LPAREN";
    EChar[EChar["RPAREN"] = 41] = "RPAREN";
    EChar[EChar["ASTERISK"] = 42] = "ASTERISK";
    EChar[EChar["PLUS"] = 43] = "PLUS";
    EChar[EChar["COMMA"] = 44] = "COMMA";
    EChar[EChar["HYPHEN"] = 45] = "HYPHEN";
    EChar[EChar["DOT"] = 46] = "DOT";
    EChar[EChar["SOLIDUS"] = 47] = "SOLIDUS";
    EChar[EChar["DIGIT_0"] = 48] = "DIGIT_0";
    EChar[EChar["DIGIT_9"] = 57] = "DIGIT_9";
    EChar[EChar["COLON"] = 58] = "COLON";
    EChar[EChar["SEMICOLON"] = 59] = "SEMICOLON";
    EChar[EChar["LESS_THAN"] = 60] = "LESS_THAN";
    EChar[EChar["EQUALS"] = 61] = "EQUALS";
    EChar[EChar["QUESTION"] = 63] = "QUESTION";
    EChar[EChar["AT"] = 64] = "AT";
    EChar[EChar["UCASE_A"] = 65] = "UCASE_A";
    EChar[EChar["UCASE_E"] = 69] = "UCASE_E";
    EChar[EChar["UCASE_F"] = 70] = "UCASE_F";
    EChar[EChar["UCASE_U"] = 85] = "UCASE_U";
    EChar[EChar["UCASE_Z"] = 90] = "UCASE_Z";
    EChar[EChar["LBRACKET"] = 91] = "LBRACKET";
    EChar[EChar["REVERSE_SOLIDUS"] = 92] = "REVERSE_SOLIDUS";
    EChar[EChar["RBRACKET"] = 93] = "RBRACKET";
    EChar[EChar["CIRCUMFLEX"] = 94] = "CIRCUMFLEX";
    EChar[EChar["UNDERSCORE"] = 95] = "UNDERSCORE";
    EChar[EChar["LCASE_A"] = 97] = "LCASE_A";
    EChar[EChar["LCASE_E"] = 101] = "LCASE_E";
    EChar[EChar["LCASE_F"] = 102] = "LCASE_F";
    EChar[EChar["LCASE_U"] = 117] = "LCASE_U";
    EChar[EChar["LCASE_Z"] = 122] = "LCASE_Z";
    EChar[EChar["LBRACE"] = 123] = "LBRACE";
    EChar[EChar["PIPE"] = 124] = "PIPE";
    EChar[EChar["RBRACE"] = 125] = "RBRACE";
    EChar[EChar["TILDA"] = 126] = "TILDA";
})(EChar || (EChar = {}));
// ==================================================================
// GLOBAL HELPER FUNCTIONS
// ==================================================================
function isWhiteSpace(c) {
    return c === EChar.SPACE || (EChar.TAB <= c && c <= EChar.CR) || c === 0x80 || c === 0x2028 || c === 0x2029;
}
function isName(c) {
    return !isNaN(c) && (isNameStart(c) || isDigit(c) || c === EChar.HYPHEN);
}
function isNameStart(c) {
    return !isNaN(c) && (isLetter(c) || isNonAscii(c) || c === EChar.UNDERSCORE);
}
function isNonPrintable(c) {
    return !isNaN(c) && ((0x00 <= c && c <= 0x08) || c === 0x0b || (0x0e <= c && c <= 0x1f) || c === 0x7f);
}
function isLetter(c) {
    return !isNaN(c) && ((EChar.UCASE_A <= c && c <= EChar.UCASE_Z) || (EChar.LCASE_A <= c && c <= EChar.LCASE_Z));
}
function isNonAscii(c) {
    return !isNaN(c) && c >= 0x80;
}
function isDigit(c) {
    return !isNaN(c) && EChar.DIGIT_0 <= c && c <= EChar.DIGIT_9;
}
function isHexDigit(c) {
    return !isNaN(c) && ((EChar.DIGIT_0 <= c && c <= EChar.DIGIT_9) ||
        (EChar.UCASE_A <= c && c <= EChar.UCASE_F) ||
        (EChar.LCASE_A <= c && c <= EChar.LCASE_F));
}
/*
function isSurrogate(c: number): boolean
{
    return 0xd800 <= c && c <= 0xdfff;
}
*/
function isEscape(c) {
    return c !== undefined && c[0] === '\\' && c[1] !== '\n';
}
/**
 * This section describes how to check if three code points would start an identifier.
 * Note: This algorithm will not consume any additional code points.
 *
 * @returns {boolean}
 *
 * @url http://www.w3.org/TR/css3-syntax/#check-if-three-code-points-would-start-an-identifier
 */
function wouldStartIdentifier(s, pos) {
    var cp = s.charCodeAt(pos);
    // If the second code point is a name-start code point or the second and third
    // code points are a valid escape, return true. Otherwise, return false.
    if (cp === EChar.HYPHEN)
        return isNameStart(s.charCodeAt(pos + 1)) || isEscape(s.substr(pos + 1, 2));
    if (isNameStart(cp))
        return true;
    // If the first and second code points are a valid escape, return true.
    if (cp === EChar.REVERSE_SOLIDUS)
        return isEscape(s.substr(pos, 2));
    // Otherwise, return false.
    return false;
}
/**
 * This section describes how to check if three code points would start a number.
 * Note: This algorithm will not consume any additional code points.
 *
 * @returns {boolean}
 *
 * @url http://www.w3.org/TR/css3-syntax/#starts-with-a-number
 */
function wouldStartNumber(s, pos) {
    var c = s.charCodeAt(pos), d;
    if (c === EChar.PLUS || c === EChar.HYPHEN) {
        d = s.charCodeAt(pos + 1);
        // If the second code point is a digit, return true.
        if (isDigit(d))
            return true;
        // Otherwise, if the second code point is a U+002E FULL STOP (.)
        // and the third code point is a digit, return true.
        if (d === EChar.DOT && isDigit(s.charCodeAt(pos + 2)))
            return true;
        // Otherwise, return false.
        return false;
    }
    if (c === EChar.DOT) {
        // If the second code point is a digit, return true. Otherwise, return false.
        return isDigit(s.charCodeAt(pos + 1));
    }
    return isDigit(c);
}
function isSignificantWhitespace(t1, t2) {
    var token1 = t1.token, token2 = t2.token, src1;
    if (token1 === EToken.IDENT) {
        return token2 === EToken.IDENT || token2 === EToken.HASH || token2 === EToken.FUNCTION ||
            token2 === EToken.URL || token2 === EToken.BAD_URL ||
            (token2 === EToken.DELIM && (t2.src === '-' || t2.src === '*' || t2.src === '.')) ||
            token2 === EToken.LBRACKET ||
            token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
            token2 === EToken.UNICODE_RANGE || token2 === EToken.CDC || token2 === EToken.LPAREN;
    }
    if (token1 === EToken.HASH || token1 === EToken.DIMENSION) {
        return token2 === EToken.IDENT || token2 === EToken.HASH || token2 === EToken.FUNCTION ||
            token2 === EToken.URL || token2 === EToken.BAD_URL ||
            (token2 === EToken.DELIM && (t2.src === '-' || t2.src === '*' || t2.src === '.')) ||
            token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
            token2 === EToken.LBRACKET ||
            token2 === EToken.UNICODE_RANGE || token2 === EToken.CDC;
    }
    if (token1 === EToken.DELIM) {
        src1 = t1.src;
        if (src1 === '#') {
            return token2 === EToken.IDENT || token2 === EToken.FUNCTION || token2 === EToken.URL ||
                token2 === EToken.BAD_URL || (token2 === EToken.DELIM && t2.src === '-') ||
                token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
                token2 === EToken.UNICODE_RANGE;
        }
        if (src1 === '-') {
            return token2 === EToken.IDENT || token2 === EToken.FUNCTION ||
                token2 === EToken.URL || token2 === EToken.BAD_URL ||
                token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
                token2 === EToken.UNICODE_RANGE;
        }
        if (src1 === '@') {
            return token2 === EToken.IDENT || token2 === EToken.FUNCTION ||
                token2 === EToken.URL || token2 === EToken.BAD_URL ||
                (token2 === EToken.DELIM && t2.src === '-') ||
                token2 === EToken.UNICODE_RANGE;
        }
        if (src1 === '*') {
            return token2 === EToken.IDENT || token2 === EToken.HASH || token2 === EToken.LBRACKET ||
                (token2 === EToken.DELIM && (t2.src === '*' || t2.src === '.'));
        }
        if (src1 === '.' || src1 === '+')
            return token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION;
        if (src1 === '$' || src1 === '*' || src1 === '^' || src1 === '~')
            return token2 === EToken.DELIM && t2.src === '=';
        if (src1 === '|')
            return token2 === EToken.DELIM && (t2.src === '=' || t2.src === '|');
        if (src1 === '/')
            return token2 === EToken.DELIM && t2.src === '*';
        return false;
    }
    if (token1 === EToken.RBRACKET) {
        return token2 === EToken.IDENT || token2 === EToken.HASH || token2 === EToken.LBRACKET ||
            (token2 === EToken.DELIM && (t2.src === '*' || t2.src === '.'));
    }
    if (token1 === EToken.NUMBER) {
        return token2 === EToken.IDENT || token2 === EToken.FUNCTION ||
            token2 === EToken.URL || token2 === EToken.BAD_URL ||
            token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
            token2 === EToken.UNICODE_RANGE;
    }
    if (token1 === EToken.UNICODE_RANGE) {
        return token2 === EToken.IDENT || token2 === EToken.FUNCTION ||
            token2 === EToken.NUMBER || token2 === EToken.PERCENTAGE || token2 === EToken.DIMENSION ||
            (token2 === EToken.DELIM && t2.src === '?');
    }
    return false;
}
// ==================================================================
// TOKENIZER IMPLEMENTATION
// ==================================================================
var Token = (function () {
    function Token() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this._children = null;
        if (typeof args[0] === 'number') {
            this.constructFromTokenType(args[0], // token
            args[1], // range
            args[2], // src
            args[3], // value
            args[4], // unit
            args[5], // type
            args[6], // start
            args[7] // end
            );
        }
        else if (typeof args[0] === 'string') {
            if (typeof args[1] === 'number') {
                this.constructFromStringAndTokenType(args[0], // token
                args[1], // token type
                args[2], // leading trivia
                args[3] // trailing trivia
                );
            }
            else if (args.length <= 2) {
                this.constructFromString(args[0], // token
                args[1] // trailing trivia
                );
            }
            else if (args.length === 3) {
                this.constructFromStringAndTrivia(args[0], // token
                args[1], // leading trivia
                args[2] // trailing trivia
                );
            }
            else
                throw new Error('No constructor with provided argument types');
        }
        else
            throw new Error('No constructor with provided argument types');
    }
    Token.prototype.getParent = function () {
        return this.parent;
    };
    Token.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this.leadingTrivia)
                this._children = this._children.concat(this.leadingTrivia);
            if (this.trailingTrivia)
                this._children = this._children.concat(this.trailingTrivia);
        }
        return this._children;
    };
    Token.prototype.getTokens = function () {
        return [this];
    };
    Token.prototype.isAncestorOf = function (node) {
        return false;
    };
    Token.prototype.walk = function (walker) {
        return walker(this, function () { return undefined; }, walker);
    };
    Token.prototype.getPrologue = function () {
        return this.triviaToString(this.leadingTrivia);
    };
    Token.prototype.getEpilogue = function () {
        return this.triviaToString(this.trailingTrivia);
    };
    Token.prototype.hasLeadingWhitespace = function () {
        var len, i;
        if (!this.leadingTrivia)
            return false;
        len = this.leadingTrivia.length;
        for (i = 0; i < len; i++)
            if (this.leadingTrivia[i].token === EToken.WHITESPACE)
                return true;
        return false;
    };
    Token.prototype.hasTrailingWhitespace = function () {
        var len, i;
        if (!this.trailingTrivia)
            return false;
        len = this.trailingTrivia.length;
        for (i = 0; i < len; i++)
            if (this.trailingTrivia[i].token === EToken.WHITESPACE)
                return true;
        return false;
    };
    Token.prototype.hasError = function () {
        return false;
    };
    Token.prototype.toString = function () {
        return this.getPrologue() + this.src + this.getEpilogue();
    };
    Token.prototype.constructFromTokenType = function (token, range, src, value, unit, type, start, end) {
        this.token = token;
        this.range = range;
        this.src = src;
        this.value = value || this.src;
        if (unit !== undefined)
            this.unit = unit;
        if (type !== undefined)
            this.type = type;
        if (start !== undefined)
            this.start = start;
        if (end !== undefined)
            this.end = end;
    };
    Token.prototype.constructFromString = function (token, trailingTrivia) {
        this.constructFromStringAndTrivia(token, null, trailingTrivia);
    };
    Token.prototype.constructFromStringAndTrivia = function (token, leadingTrivia, trailingTrivia) {
        var cp = token.charCodeAt(0), dp = token.charCodeAt(1), ep = token.charCodeAt(2), tokenType = EToken.EOF, rest;
        if (isWhiteSpace(cp))
            tokenType = EToken.WHITESPACE;
        else if (cp === EChar.QUOT || cp === EChar.APOS)
            tokenType = EToken.STRING;
        else if (cp === EChar.HASH)
            tokenType = wouldStartIdentifier(token, 1) ? EToken.HASH : EToken.DELIM;
        else if (cp === EChar.DOLLAR)
            tokenType = dp === EChar.EQUALS ? EToken.SUFFIX_MATCH : EToken.DELIM;
        else if (cp === EChar.LPAREN)
            tokenType = EToken.LPAREN;
        else if (cp === EChar.RPAREN)
            tokenType = EToken.RPAREN;
        else if (cp === EChar.ASTERISK)
            tokenType = dp === EChar.EQUALS ? EToken.SUBSTRING_MATCH : EToken.DELIM;
        else if (cp === EChar.PLUS || cp === EChar.HYPHEN || cp === EChar.DOT || isDigit(cp)) {
            if (wouldStartNumber(token, 0)) {
                rest = token.replace(/[0-9.+-]+/, '');
                if (rest === '')
                    tokenType = EToken.NUMBER;
                else if (rest === '%')
                    tokenType = EToken.PERCENTAGE;
                else
                    tokenType = EToken.DIMENSION;
            }
            else if (cp === EChar.HYPHEN && wouldStartIdentifier(token, 0))
                tokenType = EToken.IDENT;
            else
                tokenType = EToken.DELIM;
        }
        else if (cp === EChar.COMMA)
            tokenType = EToken.COMMA;
        else if (cp === EChar.SOLIDUS)
            tokenType = dp === EChar.ASTERISK ? EToken.COMMENT : EToken.DELIM;
        else if (cp === EChar.COLON)
            tokenType = EToken.COLON;
        else if (cp === EChar.SEMICOLON)
            tokenType = EToken.SEMICOLON;
        else if (cp === EChar.AT)
            tokenType = wouldStartIdentifier(token, 1) ? EToken.AT_KEYWORD : EToken.DELIM;
        else if (cp === EChar.LBRACKET)
            tokenType = EToken.LBRACKET;
        else if (cp === EChar.REVERSE_SOLIDUS)
            tokenType = isEscape(token) ? EToken.IDENT : EToken.DELIM;
        else if (cp === EChar.RBRACKET)
            tokenType = EToken.RBRACKET;
        else if (cp === EChar.CIRCUMFLEX)
            tokenType = dp === EChar.EQUALS ? EToken.PREFIX_MATCH : EToken.DELIM;
        else if (cp === EChar.LBRACE)
            tokenType = EToken.LBRACE;
        else if (cp === EChar.RBRACE)
            tokenType = EToken.RBRACE;
        else if (cp === EChar.UCASE_U || cp === EChar.LCASE_U)
            tokenType = dp === EChar.PLUS && (ep === EChar.QUESTION || isHexDigit(ep)) ? EToken.UNICODE_RANGE : EToken.IDENT;
        else if (isNameStart(cp))
            tokenType = EToken.IDENT;
        else if (cp === EChar.PIPE) {
            if (dp === EChar.EQUALS)
                tokenType = EToken.DASH_MATCH;
            else if (dp === EChar.PIPE)
                tokenType = EToken.COLUMN;
            else
                tokenType = EToken.DELIM;
        }
        else if (cp === EChar.TILDA)
            tokenType = dp === EChar.EQUALS ? EToken.INCLUDE_MATCH : EToken.DELIM;
        else
            tokenType = EToken.DELIM;
        this.constructFromStringAndTokenType(token, tokenType, leadingTrivia, trailingTrivia);
    };
    Token.prototype.constructFromStringAndTokenType = function (token, tokenType, leadingTrivia, trailingTrivia) {
        var len, i;
        this.token = tokenType;
        this.src = token;
        if (leadingTrivia) {
            this.leadingTrivia = [];
            len = leadingTrivia.length;
            for (i = 0; i < len; i++)
                this.leadingTrivia.push(new Token(leadingTrivia[i]));
        }
        if (trailingTrivia) {
            this.trailingTrivia = [];
            len = trailingTrivia.length;
            for (i = 0; i < len; i++)
                this.trailingTrivia.push(new Token(trailingTrivia[i]));
        }
    };
    Token.prototype.triviaToString = function (triviaToken) {
        var s = '', len, i;
        if (!triviaToken)
            return '';
        len = triviaToken.length;
        for (i = 0; i < len; i++)
            s += triviaToken[i].src;
        return s;
    };
    return Token;
})();
exports.Token = Token;
var Tokenizer = (function () {
    /**
     * Constructs the tokenizer.
     *
     * @param src The source code to tokenize
     * @param options
     */
    function Tokenizer(src, options) {
        this._pos = 0;
        this._line = 0;
        this._column = 0;
        this._currentToken = null;
        this._nextToken = null;
        this._src = src;
        this._options = options || {};
        if (this._options.lineBase === undefined)
            this._options.lineBase = 0;
        if (this._options.columnBase === undefined)
            this._options.columnBase = this._options.lineBase;
        this._line = this._options.lineBase;
        this._column = this._options.columnBase;
    }
    /**
     * Returns the next token in the token stream.
     * Leading and trailing whitespaces and comments of a token are returned
     * in the leadingTrivia and trailingTrivia properties of the token.
     *
     * @returns {Token}
     */
    Tokenizer.prototype.nextToken = function () {
        var leadingTrivia = [], trailingTrivia = [], len, i, whitespaceIdx, lastRange, currentToken = this._currentToken, t;
        if (this._nextToken !== null) {
            t = this._currentToken;
            this._currentToken = this._nextToken;
            this._nextToken = null;
            return t;
        }
        if (currentToken === null) {
            for (t = this.getNextToken();;) {
                if (t.token === EToken.WHITESPACE || t.token === EToken.COMMENT)
                    leadingTrivia.push(t);
                else {
                    currentToken = t;
                    break;
                }
                t = this.getNextToken();
            }
        }
        for (t = this.getNextToken();;) {
            if (t.token === EToken.WHITESPACE || t.token === EToken.COMMENT)
                trailingTrivia.push(t);
            else {
                len = trailingTrivia.length;
                whitespaceIdx = -1;
                for (i = 0; i < len; i++) {
                    if (trailingTrivia[i].token === EToken.WHITESPACE) {
                        whitespaceIdx = i;
                        break;
                    }
                }
                if (whitespaceIdx >= 0 && isSignificantWhitespace(currentToken, t)) {
                    // token is a significant whitespace
                    // find the first whitespace in the list of trailing trivia
                    // set the current token to the whitespace
                    this._currentToken = trailingTrivia[whitespaceIdx];
                    if (whitespaceIdx + 1 < len) {
                        this._currentToken.trailingTrivia = trailingTrivia.slice(whitespaceIdx + 1);
                        lastRange = trailingTrivia[len - 1].range;
                        this._currentToken.range.endLine = lastRange.endLine;
                        this._currentToken.range.endColumn = lastRange.endColumn;
                    }
                    this._nextToken = t;
                    // remove the significant whitespace and the following trivia from the
                    // trailing trivia of the current token
                    trailingTrivia = trailingTrivia.slice(0, whitespaceIdx);
                }
                else
                    this._currentToken = t;
                break;
            }
            t = this.getNextToken();
        }
        if (leadingTrivia.length > 0) {
            currentToken.leadingTrivia = leadingTrivia;
            currentToken.range.startLine = leadingTrivia[0].range.startLine;
            currentToken.range.startColumn = leadingTrivia[0].range.startColumn;
        }
        len = trailingTrivia.length;
        if (len > 0) {
            currentToken.trailingTrivia = trailingTrivia;
            currentToken.range.endLine = trailingTrivia[len - 1].range.endLine;
            currentToken.range.endColumn = trailingTrivia[len - 1].range.endColumn;
        }
        return currentToken;
    };
    /**
     * Constructs a new token.
     *
     * @param token
     * @param src
     * @param value
     * @param unit
     * @param type
     * @param start
     * @param end
     * @returns {Token}
     */
    Tokenizer.prototype.token = function (token, src, value, unit, type, start, end) {
        return new Token(token, {
            startLine: this._startLine,
            startColumn: Math.max(0, this._startColumn),
            endLine: this._line,
            endColumn: Math.max(0, this._column)
        }, src || this._src.substring(this._startPos, this._pos), value, unit, type, start, end);
    };
    /**
     * Returns the next token in the stream.
     * Whitespaces and comments are returned as separate tokens.
     *
     * @returns {IToken}
     */
    Tokenizer.prototype.getNextToken = function () {
        var c, cp, d, name, isID, start;
        this._startPos = this._pos;
        this._startLine = this._line;
        this._startColumn = this._column;
        c = this._src[this._pos];
        cp = this._src.charCodeAt(this._pos);
        if (isWhiteSpace(cp)) {
            this.consumeWhiteSpace();
            return this.token(EToken.WHITESPACE);
        }
        if (cp === EChar.QUOT)
            return this.consumeString(c, cp);
        if (cp === EChar.HASH) {
            c = this.nextChar();
            if (isName(this._src.charCodeAt(this._pos)) || this.validEscape(c)) {
                isID = this.wouldStartIdentifier();
                name = this.consumeName();
                return this.token(EToken.HASH, '#' + name, name, undefined, isID ? 'id' : undefined);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.DOLLAR) {
            c = this.nextChar();
            if (c === '=') {
                this.nextChar();
                return this.token(EToken.SUFFIX_MATCH);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.APOS)
            return this.consumeString(c, cp);
        if (cp === EChar.LPAREN) {
            this.nextChar();
            return this.token(EToken.LPAREN);
        }
        if (cp === EChar.RPAREN) {
            this.nextChar();
            return this.token(EToken.RPAREN);
        }
        if (cp === EChar.ASTERISK) {
            c = this.nextChar();
            if (c === '=') {
                this.nextChar();
                return this.token(EToken.SUBSTRING_MATCH);
            }
            else if (c === '/' && this._options.tokenizeComments) {
                this.nextChar();
                return this.token(EToken.RCOMMENT, '*/');
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.PLUS) {
            if (this.wouldStartNumber())
                return this.consumeNumeric();
            this.nextChar();
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.COMMA) {
            this.nextChar();
            return this.token(EToken.COMMA);
        }
        if (cp === EChar.HYPHEN) {
            if (this.wouldStartNumber())
                return this.consumeNumeric();
            if (this.wouldStartIdentifier())
                return this.consumeIdentLike();
            c = this.nextChar();
            if (c === '-' && this._src[this._pos + 1] === '>') {
                this.nextChar();
                this.nextChar();
                return this.token(EToken.CDC, '-->');
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.DOT) {
            if (this.wouldStartNumber())
                return this.consumeNumeric();
            this.nextChar();
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.SOLIDUS) {
            c = this.nextChar();
            if (c === '*') {
                if (this._options.tokenizeComments) {
                    this.nextChar();
                    return this.token(EToken.LCOMMENT, '/*');
                }
                for (;;) {
                    c = this.nextChar();
                    if ((c === '*' && this._src[this._pos + 1] === '/') || c === undefined) {
                        this.nextChar(); // consume '*'
                        this.nextChar(); // consume '/'
                        return this.token(EToken.COMMENT);
                    }
                }
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.COLON) {
            this.nextChar();
            return this.token(EToken.COLON);
        }
        if (cp === EChar.SEMICOLON) {
            this.nextChar();
            return this.token(EToken.SEMICOLON);
        }
        if (cp === EChar.LESS_THAN) {
            c = this.nextChar();
            if (c === '!' && this._src[this._pos + 1] === '-' && this._src[this._pos + 2] === '-') {
                this.nextChar(); // consume '!'
                this.nextChar(); // consume first '-'
                this.nextChar(); // consume second '-'
                return this.token(EToken.CDO);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.AT) {
            c = this.nextChar();
            if (this.wouldStartIdentifier()) {
                name = this.consumeName();
                return this.token(EToken.AT_KEYWORD, '@' + name, name);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.LBRACKET) {
            this.nextChar();
            return this.token(EToken.LBRACKET);
        }
        if (cp === EChar.REVERSE_SOLIDUS) {
            if (this.validEscape())
                return this.consumeIdentLike();
            this.nextChar();
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.RBRACKET) {
            this.nextChar();
            return this.token(EToken.RBRACKET);
        }
        if (cp === EChar.CIRCUMFLEX) {
            c = this.nextChar();
            if (c === '=') {
                this.nextChar();
                return this.token(EToken.PREFIX_MATCH);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.LBRACE) {
            this.nextChar();
            return this.token(EToken.LBRACE);
        }
        if (cp === EChar.RBRACE) {
            this.nextChar();
            return this.token(EToken.RBRACE);
        }
        if (isDigit(cp))
            return this.consumeNumeric();
        if (cp === EChar.UCASE_U || cp === EChar.LCASE_U) {
            d = this._src.charCodeAt(this._pos + 2);
            if (this._src.charCodeAt(this._pos + 1) === EChar.PLUS && (isHexDigit(d) || d === EChar.QUESTION)) {
                // consume 'u'/'U' and '+'
                start = c + this.nextChar();
                this.nextChar();
                return this.consumeUnicodeRange(start);
            }
            return this.consumeIdentLike();
        }
        if (isNameStart(cp))
            return this.consumeIdentLike();
        if (cp === EChar.PIPE) {
            c = this.nextChar();
            cp = this._src.charCodeAt(this._pos);
            if (cp === EChar.EQUALS) {
                this.nextChar();
                return this.token(EToken.DASH_MATCH);
            }
            if (cp === EChar.PIPE) {
                this.nextChar();
                return this.token(EToken.COLUMN);
            }
            return this.token(EToken.DELIM);
        }
        if (cp === EChar.TILDA) {
            c = this.nextChar();
            if (c === '=') {
                this.nextChar();
                return this.token(EToken.INCLUDE_MATCH);
            }
            return this.token(EToken.DELIM);
        }
        // EOF
        if (isNaN(cp))
            return this.token(EToken.EOF);
        this.nextChar();
        return this.token(EToken.DELIM);
    };
    Tokenizer.prototype.nextChar = function () {
        var c = this._src[this._pos];
        if (c === '\r' || (c === '\n' && this._src[this._pos - 1] !== '\r')) {
            this._column = this._options.columnBase;
            ++this._line;
        }
        else
            ++this._column;
        ++this._pos;
        return this._src[this._pos];
    };
    /**
     * This section describes how to check if two code points are a valid escape.
     * Note: This algorithm will not consume any additional code point.
     *
     * @param c
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#check-if-two-code-points-are-a-valid-escape
     */
    Tokenizer.prototype.validEscape = function (c) {
        if (c !== undefined)
            return isEscape(c + this._src[this._pos]);
        return isEscape(this._src.substr(this._pos, 2));
    };
    /**
     * This section describes how to check if three code points would start an identifier.
     * Note: This algorithm will not consume any additional code points.
     *
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#check-if-three-code-points-would-start-an-identifier
     */
    Tokenizer.prototype.wouldStartIdentifier = function () {
        return wouldStartIdentifier(this._src, this._pos);
    };
    /**
     * This section describes how to check if three code points would start a number.
     * Note: This algorithm will not consume any additional code points.
     *
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#starts-with-a-number
     */
    Tokenizer.prototype.wouldStartNumber = function () {
        return wouldStartNumber(this._src, this._pos);
    };
    Tokenizer.prototype.consumeWhiteSpace = function () {
        var s = '', c, cp;
        for (c = this._src[this._pos];;) {
            cp = c === undefined ? NaN : c.charCodeAt(0);
            if (isWhiteSpace(cp)) {
                s += c;
                c = this.nextChar();
            }
            else
                break;
        }
        return s;
    };
    /**
     * This section describes how to consume an escaped code point.
     * It assumes that the U+005C REVERSE SOLIDUS (\) has already been consumed
     * and that the next input code point has already been verified to not
     * be a newline. It will return a code point.
     *
     * @returns {string}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-an-escaped-code-point
     */
    Tokenizer.prototype.consumeEscape = function () {
        var s, c = this.nextChar(), i;
        // num: number;
        if (isHexDigit(this._src.charCodeAt(this._pos))) {
            s = c;
            for (i = 0; i < 5; i++) {
                if (isHexDigit(this._src.charCodeAt(this._pos)))
                    s += this.nextChar();
                else
                    break;
            }
            if (isWhiteSpace(this._src.charCodeAt(this._pos)))
                s += this.nextChar();
            /*
            num = parseInt(s, 16);
            if (num === 0 || isSurrogate(num) || num >= 0x10ffff)
                return '\ufffd';

            return String.fromCharCode(num);
            */
            return s;
        }
        if (c === undefined)
            return '\ufffd';
        return c;
    };
    /**
     * This section describes how to consume a name from a stream of code points.
     * It returns a string containing the largest name that can be formed from
     * adjacent code points in the stream, starting from the first.
     *
     * Note: This algorithm does not do the verification of the first few
     * code points that are necessary to ensure the returned code points would
     * constitute an <ident-token>.
     * If that is the intended use, ensure that the stream starts with an identifier
     * before calling this algorithm.
     *
     * @returns {string}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-name
     */
    Tokenizer.prototype.consumeName = function () {
        var s = this._src[this._pos], c;
        for (;;) {
            c = this.nextChar();
            if (isName(this._src.charCodeAt(this._pos)))
                s += c;
            else if (this.validEscape(c))
                s += c + this.consumeEscape();
            else
                break;
        }
        return s;
    };
    /**
     * This section describes how to consume a number from a stream of code points.
     * It returns a 3-tuple of a string representation, a numeric value,
     * and a type flag which is either "integer" or "number".
     *
     * Note: This algorithm does not do the verification of the first few
     * code points that are necessary to ensure a number can be obtained from
     * the stream. Ensure that the stream starts with a number before calling
     * this algorithm.
     *
     * @returns {string}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-number
     */
    Tokenizer.prototype.consumeNumber = function () {
        var s = '', c = this._src[this._pos], cp = this._src.charCodeAt(this._pos), d;
        if (cp === EChar.PLUS || cp === EChar.HYPHEN) {
            s += c;
            c = this.nextChar();
            cp = this._src.charCodeAt(this._pos);
        }
        for (;;) {
            if (isDigit(cp)) {
                s += c;
                c = this.nextChar();
                cp = this._src.charCodeAt(this._pos);
            }
            else
                break;
        }
        if (cp === EChar.DOT && isDigit(this._src.charCodeAt(this._pos + 1))) {
            s += c;
            for (c = this.nextChar();;) {
                if (isDigit(this._src.charCodeAt(this._pos))) {
                    s += c;
                    c = this.nextChar();
                }
                else
                    break;
            }
        }
        cp = this._src.charCodeAt(this._pos);
        d = this._src.charCodeAt(this._pos + 1);
        if ((cp === EChar.UCASE_E || cp === EChar.LCASE_E) &&
            (isDigit(d) || ((d === EChar.PLUS || d === EChar.HYPHEN) && isDigit(this._src.charCodeAt(this._pos + 2))))) {
            s += c;
            if (d === EChar.PLUS || d === EChar.HYPHEN)
                s += this.nextChar();
            for (c = this.nextChar();;) {
                if (isDigit(this._src.charCodeAt(this._pos))) {
                    s += c;
                    c = this.nextChar();
                }
                else
                    break;
            }
        }
        return s;
    };
    /**
     * This section describes how to consume a numeric token from a stream of code points.
     * It returns either a <number-token>, <percentage-token>, or <dimension-token>.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-numeric-token
     */
    Tokenizer.prototype.consumeNumeric = function () {
        // Consume a number.
        var num = this.consumeNumber(), c = this._src[this._pos], unit;
        // If the next 3 input code points would start an identifier, then:
        if (this.wouldStartIdentifier()) {
            // Create a <dimension-token> with the same representation, value,
            // and type flag as the returned number, and a unit set initially
            // to the empty string.
            // Consume a name. Set the <dimension-token>’s unit to the returned value.
            unit = this.consumeName();
            // Return the <dimension-token>.
            return this.token(EToken.DIMENSION, num + unit, parseFloat(num), unit);
        }
        // Otherwise, if the next input code point is U+0025 PERCENTAGE SIGN (%),
        // consume it. Create a <percentage-token> with the same representation
        // and value as the returned number, and return it.
        if (c === '%') {
            this.nextChar();
            return this.token(EToken.PERCENTAGE, num + '%', parseFloat(num));
        }
        // Otherwise, create a <number-token> with the same representation,
        // value, and type flag as the returned number, and return it.
        return this.token(EToken.NUMBER, num, parseFloat(num));
    };
    /**
     * This section describes how to consume an ident-like token from a stream of code points.
     * It returns an <ident-token>, <function-token>, <url-token>, or <bad-url-token>.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-an-ident-like-token
     */
    Tokenizer.prototype.consumeIdentLike = function () {
        // Consume a name.
        var name = this.consumeName(), c = this._src[this._pos];
        // If the returned string’s value is an ASCII case-insensitive match
        // for "url", and the next input code point is U+0028 LEFT PARENTHESIS ((),
        // consume it. Consume a url token, and return it.
        if (name.toLowerCase() === 'url' && c === '(') {
            this.nextChar(); // consume the '('
            return this.consumeURL(name);
        }
        // Otherwise, if the next input code point is U+0028 LEFT PARENTHESIS ((),
        // consume it. Create a <function-token> with its value set to the returned
        // string and return it.
        if (c === '(') {
            this.nextChar();
            return this.token(EToken.FUNCTION, name + c, name);
        }
        // Otherwise, create an <ident-token> with its value set to the returned
        // string and return it.
        return this.token(EToken.IDENT, name);
    };
    /**
     * This section describes how to consume a string token from a stream of code points.
     * It returns either a <string-token> or <bad-string-token>.
     *
     * @param end The string end character
     * @param cpEnd The string end code point
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-string-token
     */
    Tokenizer.prototype.consumeString = function (end, cpEnd) {
        var s = '', c, cp;
        // Repeatedly consume the next input code point from the stream:
        for (c = this.nextChar();;) {
            cp = this._src.charCodeAt(this._pos);
            if (cp === cpEnd) {
                // Return the <string-token>.
                this.nextChar();
                break;
            }
            else if (isNaN(cp)) {
                // Return the <string-token>.
                return this.token(EToken.BAD_STRING, end + s, s);
            }
            else if (cp === EChar.LF) {
                // This is a parse error.
                // Reconsume the current input code point, create a
                // <bad-string-token>, and return it.
                return this.token(EToken.BAD_STRING, end + s, s);
            }
            else if (cp === EChar.REVERSE_SOLIDUS) {
                // If the next input code point is EOF, do nothing.
                // Otherwise, if the next input code point is a newline, consume it.
                // Otherwise, if the stream starts with a valid escape, consume
                // an escaped code point and append the returned code point to the
                // <string-token>’s value.
                c = this.nextChar();
                cp = this._src.charCodeAt(this._pos);
                if (cp !== EChar.LF)
                    s += '\\' + c;
            }
            else {
                // anything else:
                // Append the current input code point to the <string-token>’s value.
                s += c;
            }
            c = this.nextChar();
        }
        return this.token(EToken.STRING, end + s + end, s);
    };
    /**
     * This section describes how to consume a url token from a stream of code points.
     * It returns either a <url-token> or a <bad-url-token>.
     *
     * Note: This algorithm assumes that the initial "url(" has already been consumed.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-url-token
     */
    Tokenizer.prototype.consumeURL = function (fnxName) {
        var s, c, cp, str, src, withWhiteSpace;
        fnxName += '(';
        // step 1
        // Initially create a <url-token> with its value set to the empty string.
        // step 2
        // Consume as much whitespace as possible.
        fnxName += this.consumeWhiteSpace();
        c = this._src[this._pos];
        cp = this._src.charCodeAt(this._pos);
        // step 3
        // If the next input code point is EOF, return the <url-token>.
        if (isNaN(cp))
            return this.token(EToken.URL, fnxName + ')', '');
        // step 4
        // If the next input code point is a U+0022 QUOTATION MARK (")
        // or U+0027 APOSTROPHE (‘), then:
        if (cp === EChar.QUOT || cp === EChar.APOS) {
            // step 4.1
            // Consume a string token with the current input code point
            // as the ending code point.
            str = this.consumeString(c, cp);
            // step 4.2
            // If a <bad-string-token> was returned, consume the remnants
            // of a bad url, create a <bad-url-token>, and return it.
            if (str.token === EToken.BAD_STRING)
                return this.consumeBadURLRemnants();
            // step 4.3
            // Set the <url-token>’s value to the returned <string-token>’s value.
            src = str.src;
            // step 4.4
            // Consume as much whitespace as possible.
            src += this.consumeWhiteSpace();
            // step 4.5
            // If the next input code point is U+0029 RIGHT PARENTHESIS ()) or EOF,
            // consume it and return the <url-token>; otherwise, consume the remnants
            // of a bad url, create a <bad-url-token>, and return it.
            c = this._src[this._pos];
            cp = this._src.charCodeAt(this._pos);
            if (cp === EChar.RPAREN || isNaN(cp)) {
                this.nextChar();
                return this.token(EToken.URL, fnxName + src + ')', str.value);
            }
            return this.consumeBadURLRemnants();
        }
        // step 5
        // Repeatedly consume the next input code point from the stream:
        for (s = '';;) {
            if (cp === EChar.RPAREN || isNaN(cp)) {
                this.nextChar();
                return this.token(EToken.URL, fnxName + s + ')', s);
            }
            // Consume as much whitespace as possible.
            // If the next input code point is U+0029 RIGHT PARENTHESIS ()) or EOF,
            // consume it and return the <url-token>;
            // otherwise, consume the remnants of a bad url, create a <bad-url-token>,
            // and return it.
            if (isWhiteSpace(cp)) {
                withWhiteSpace = s + this.consumeWhiteSpace();
                cp = this._src.charCodeAt(this._pos);
                if (cp === EChar.RPAREN || isNaN(cp)) {
                    this.nextChar();
                    return this.token(EToken.URL, fnxName + withWhiteSpace + ')', s);
                }
                return this.consumeBadURLRemnants();
            }
            // This is a parse error. Consume the remnants of a bad url,
            // create a <bad-url-token>, and return it.
            if (cp === EChar.QUOT || cp === EChar.APOS || cp === EChar.LPAREN || isNonPrintable(cp))
                return this.consumeBadURLRemnants();
            // If the stream starts with a valid escape, consume an escaped
            // code point and append the returned code point to the <url-token>’s value.
            // Otherwise, this is a parse error. Consume the remnants of a bad url,
            // create a <bad-url-token>, and return it.
            if (cp === EChar.REVERSE_SOLIDUS) {
                if (this.validEscape(c))
                    s += c + this.consumeEscape();
                else
                    return this.consumeBadURLRemnants();
            }
            else {
                // anything else:
                // Append the current input code point to the <url-token>’s value.
                s += c;
            }
            c = this.nextChar();
            cp = this._src.charCodeAt(this._pos);
        }
    };
    /**
     * This section describes how to consume the remnants of a bad url from a stream
     * of code points, "cleaning up" after the tokenizer realizes that it’s in the middle
     * of a <bad-url-token> rather than a <url-token>.
     * It returns nothing; its sole use is to consume enough of the input stream to reach
     * a recovery point where normal tokenizing can resume.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-the-remnants-of-a-bad-url
     */
    Tokenizer.prototype.consumeBadURLRemnants = function () {
        var c, cp;
        for (;;) {
            c = this.nextChar();
            cp = this._src.charCodeAt(this._pos);
            if (cp === EChar.RPAREN || isNaN(cp)) {
                this.nextChar();
                return this.token(EToken.BAD_URL);
            }
            if (this.validEscape(c))
                this.consumeEscape();
        }
    };
    /**
     * This section describes how to consume a unicode-range token.
     * It returns a <unicode-range-token>.
     *
     * Note: This algorithm assumes that the initial "u+" has been consumed,
     * and the next code point verified to be a hex digit or a "?".
     *
     * @param start The start string of the unicode range (e.g., "U+")
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-unicode-range-token
     */
    Tokenizer.prototype.consumeUnicodeRange = function (start) {
        var s = '', c, rangeStart, rangeEnd, hasQuestionMarks = false, i, end;
        // step 1a
        // Consume as many hex digits as possible, but no more than 6
        c = this._src[this._pos];
        for (i = 0; i < 6; i++) {
            if (isHexDigit(this._src.charCodeAt(this._pos))) {
                s += c;
                c = this.nextChar();
            }
            else
                break;
        }
        // step 1b
        // If less than 6 hex digits were consumed, consume as many
        // U+003F QUESTION MARK (?) code points as possible,
        // but no more than enough to make the total of hex digits
        // and U+003F QUESTION MARK (?) code points equal to 6.
        c = this._src[this._pos];
        for (; i < 6; i++) {
            if (c === '?') {
                s += c;
                c = this.nextChar();
                hasQuestionMarks = true;
            }
            else
                break;
        }
        if (hasQuestionMarks) {
            // step 1.1
            // Interpret the consumed code points as a hexadecimal number,
            // with the U+003F QUESTION MARK (?) code points replaced by
            // U+0030 DIGIT ZERO (0) code points. This is the start of the range.
            rangeStart = parseInt(s.replace(/\?/g, '0'), 16);
            // step 1.2
            // Interpret the consumed code points as a hexadecimal number again,
            // with the U+003F QUESTION MARK (?) code point replaced by
            // U+0046 LATIN CAPITAL LETTER F (F) code points. This is the end of the range.
            rangeEnd = parseInt(s.replace(/\?/g, 'f'), 16);
            return this.token(EToken.UNICODE_RANGE, start + s, undefined, undefined, undefined, rangeStart, rangeEnd);
        }
        // Otherwise, interpret the digits as a hexadecimal number. This is the start of the range.
        rangeStart = parseInt(s, 16);
        rangeEnd = rangeStart;
        // step 2:
        // If the next 2 input code point are U+002D HYPHEN-MINUS (-) followed by a hex digit, then:
        if (this._src.charCodeAt(this._pos) === EChar.HYPHEN && isHexDigit(this._src.charCodeAt(this._pos + 1))) {
            // step 2.1:
            // Consume the next input code point.
            s += '-';
            c = this.nextChar();
            // step 2.2:
            // Consume as many hex digits as possible, but no more than 6.
            // Interpret the digits as a hexadecimal number. This is the end of the range.
            end = '';
            for (i = 0; i < 5; i++) {
                if (isHexDigit(this._src.charCodeAt(this._pos))) {
                    s += c;
                    end += c;
                    c = this.nextChar();
                }
                else
                    break;
            }
            rangeEnd = parseInt(end, 16);
        }
        return this.token(EToken.UNICODE_RANGE, start + s, undefined, undefined, undefined, rangeStart, rangeEnd);
    };
    return Tokenizer;
})();
exports.Tokenizer = Tokenizer;
