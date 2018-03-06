import T = require('./types');
import AST = require('./ast');
export interface ITokenizerOptions {
    tokenizeComments?: boolean;
    lineBase?: number;
    columnBase?: number;
}
export declare enum EToken {
    IDENT = 0,
    FUNCTION = 1,
    AT_KEYWORD = 2,
    HASH = 3,
    STRING = 4,
    BAD_STRING = 5,
    URL = 6,
    BAD_URL = 7,
    DELIM = 8,
    NUMBER = 9,
    PERCENTAGE = 10,
    DIMENSION = 11,
    UNICODE_RANGE = 12,
    INCLUDE_MATCH = 13,
    DASH_MATCH = 14,
    PREFIX_MATCH = 15,
    SUFFIX_MATCH = 16,
    SUBSTRING_MATCH = 17,
    COLUMN = 18,
    WHITESPACE = 19,
    COMMENT = 20,
    CDO = 21,
    CDC = 22,
    COLON = 23,
    SEMICOLON = 24,
    COMMA = 25,
    LBRACKET = 26,
    RBRACKET = 27,
    LPAREN = 28,
    RPAREN = 29,
    LBRACE = 30,
    RBRACE = 31,
    LCOMMENT = 32,
    RCOMMENT = 33,
    EOF = 34,
}
export declare class Token implements T.INode {
    token: EToken;
    src: string;
    value: any;
    unit: string;
    type: string;
    start: number;
    end: number;
    range: T.ISourceRange;
    leadingTrivia: Token[];
    trailingTrivia: Token[];
    parent: T.INode;
    _children: Token[];
    constructor(token: number, range: T.ISourceRange, src?: string, value?: any, unit?: string, type?: string, start?: number, end?: number);
    constructor(token: string, trailingTrivia?: string[]);
    constructor(token: string, leadingTrivia: string[], trailingTrivia: string[]);
    constructor(token: string, tokenType: number, leadingTrivia: string[], trailingTrivia: string[]);
    getParent(): T.INode;
    getChildren(): T.INode[];
    getTokens(): Token[];
    isAncestorOf(node: T.INode): boolean;
    walk(walker: AST.IASTWalker): any;
    getPrologue(): string;
    getEpilogue(): string;
    hasLeadingWhitespace(): boolean;
    hasTrailingWhitespace(): boolean;
    hasError(): boolean;
    toString(): string;
    private constructFromTokenType(token, range, src?, value?, unit?, type?, start?, end?);
    private constructFromString(token, trailingTrivia?);
    private constructFromStringAndTrivia(token, leadingTrivia, trailingTrivia);
    private constructFromStringAndTokenType(token, tokenType, leadingTrivia, trailingTrivia);
    private triviaToString(triviaToken);
}
export declare class Tokenizer {
    private _src;
    private _pos;
    private _line;
    private _column;
    private _startPos;
    private _startLine;
    private _startColumn;
    private _options;
    private _currentToken;
    private _nextToken;
    /**
     * Constructs the tokenizer.
     *
     * @param src The source code to tokenize
     * @param options
     */
    constructor(src: string, options?: ITokenizerOptions);
    /**
     * Returns the next token in the token stream.
     * Leading and trailing whitespaces and comments of a token are returned
     * in the leadingTrivia and trailingTrivia properties of the token.
     *
     * @returns {Token}
     */
    nextToken(): Token;
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
    private token(token, src?, value?, unit?, type?, start?, end?);
    /**
     * Returns the next token in the stream.
     * Whitespaces and comments are returned as separate tokens.
     *
     * @returns {IToken}
     */
    private getNextToken();
    private nextChar();
    /**
     * This section describes how to check if two code points are a valid escape.
     * Note: This algorithm will not consume any additional code point.
     *
     * @param c
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#check-if-two-code-points-are-a-valid-escape
     */
    private validEscape(c?);
    /**
     * This section describes how to check if three code points would start an identifier.
     * Note: This algorithm will not consume any additional code points.
     *
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#check-if-three-code-points-would-start-an-identifier
     */
    private wouldStartIdentifier();
    /**
     * This section describes how to check if three code points would start a number.
     * Note: This algorithm will not consume any additional code points.
     *
     * @returns {boolean}
     *
     * @url http://www.w3.org/TR/css3-syntax/#starts-with-a-number
     */
    private wouldStartNumber();
    private consumeWhiteSpace();
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
    private consumeEscape();
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
    private consumeName();
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
    private consumeNumber();
    /**
     * This section describes how to consume a numeric token from a stream of code points.
     * It returns either a <number-token>, <percentage-token>, or <dimension-token>.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-a-numeric-token
     */
    private consumeNumeric();
    /**
     * This section describes how to consume an ident-like token from a stream of code points.
     * It returns an <ident-token>, <function-token>, <url-token>, or <bad-url-token>.
     *
     * @returns {IToken}
     *
     * @url http://www.w3.org/TR/css3-syntax/#consume-an-ident-like-token
     */
    private consumeIdentLike();
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
    private consumeString(end, cpEnd);
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
    private consumeURL(fnxName);
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
    private consumeBadURLRemnants();
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
    private consumeUnicodeRange(start);
}
