import AST = require('./ast');
import Tokenizer = require('./tokenizer');
export interface IParseOptions extends Tokenizer.ITokenizerOptions {
    preferLeadingTrivia?: boolean;
}
export interface IAtRuleSpec {
    keyword: string;
    astClass: new (atKeyword: Tokenizer.Token, prelude?: AST.ComponentValueList, block?: any) => AST.AtRule;
    type: EAtRule;
}
export declare enum EAtRule {
    SIMPLE = 0,
    RULE_LIST = 1,
    DECLARATION_LIST = 2,
}
export declare function parse(styleSheetSrc: string, options?: IParseOptions): AST.StyleSheet;
export declare function parseRule(ruleSrc: string, options?: IParseOptions): AST.AbstractRule;
export declare function parseSelectors(selectorsSrc: string, options?: IParseOptions): AST.SelectorList;
export declare function parseSelector(selectorSrc: string, options?: IParseOptions): AST.Selector;
export declare function parseDeclarations(declarationsSrc: string, options?: IParseOptions): AST.DeclarationList;
export declare function parseDeclaration(declarationSrc: string, options?: IParseOptions): AST.Declaration;
export declare var atRules: IAtRuleSpec[];
export declare class Parser {
    private _tokenizer;
    private _currentToken;
    constructor(src: string, options?: Tokenizer.ITokenizerOptions);
    /**
     * Parses a style sheet.
     *
     * @returns {AST.StyleSheet}
     */
    parseStyleSheet(): AST.StyleSheet;
    /**
     * Parses a block of rules, i.e., rules contained within curly braces,
     * "{" (rules) "}".
     *
     * @returns {AST.RuleList}
     */
    parseRuleBlock(): AST.RuleList;
    /**
     * Parses a list of rules.
     *
     * @param isBlock If set to true, it is expected that the rules are enclosed in curly braces
     *
     * @returns {AST.RuleList}
     */
    parseRuleList(isBlock?: boolean): AST.RuleList;
    /**
     * Parses a qualified rule.
     *
     * @returns {AST.Rule}
     */
    parseQualifiedRule(): AST.Rule;
    /**
     * Parses an (arbitrary) @rule.
     *
     * @returns {AST.AtRule}
     */
    parseAtRule(): AST.AtRule;
    /**
     * Parses a list of declarations (e.g., properties).
     *
     * @returns {AST.DeclarationList}
     */
    parseDeclarationList(): AST.DeclarationList;
    /**
     * Parses a single declaration.
     *
     * @returns {AST.Declaration}
     */
    parseDeclaration(throwErrors?: boolean, omitSemicolon?: boolean): AST.Declaration;
    /**
     * Parses the trailing tokens of the current token for disabled declarations
     * (declarations which are commented out in the source code).
     *
     * @param token
     * @returns {*}
     */
    parseTrailingTokensForDisabledDeclarations(token: Tokenizer.Token): AST.Declaration[];
    /**
     * Parses a single disabled (i.e., commented out) declaration.
     *
     * @param token
     * @returns {*}
     */
    parseDisabledDeclaration(token: Tokenizer.Token, throwErrors?: boolean): AST.Declaration;
    /**
     * Parses a declaration value (i.e., the part that comes after the ":" in a declaration).
     *
     * @returns {AST.DeclarationValue}
     */
    parseDeclarationValue(): AST.DeclarationValue;
    /**
     * Parses a list of selectors.
     *
     * @returns {AST.SelectorList}
     */
    parseSelectorList(): AST.SelectorList;
    /**
     * Parses a single selector.
     *
     * @returns {AST.Selector}
     */
    parseSelector(): AST.Selector;
    /**
     * Parses a list of component values.
     *
     * @returns {AST.ComponentValueList}
     */
    parseComponentValueList(...endTokens: Tokenizer.EToken[]): AST.ComponentValue[];
    /**
     * Parses a block component value (any block enclosed in parentheses, square brackets,
     * or curly braces).
     *
     * @returns {AST.BlockComponentValue}
     */
    parseBlock(): AST.BlockComponentValue;
    /**
     * Parses a function.
     *
     * @returns {AST.FunctionComponentValue}
     */
    parseFunction(): AST.FunctionComponentValue;
    getCurrentToken(): Tokenizer.Token;
    /**
     * Returns the next token in the token stream.
     *
     * @returns {IToken}
     */
    private nextToken();
    /**
     * Makes sure that the current token is one of the token types passed
     * as arguments to the method.
     * If the current token doesn't match this specification, an exception
     * (of type IParseError) is thrown.
     *
     * @param tokens
     */
    private expect(...args);
    /**
     * Concatenates the AST nodes "nodes" to the ones contained in the parse error object
     * "e" and re-throws the exception.
     *
     * @param e
     * @param nodes
     */
    private rethrow(e, nodes);
    /**
     * Cleans up the token stream by consuming all the tokens until "endToken" is found.
     * Adds all the tokens encountered until then to the epilogue of the current entity.
     *
     * @param e
     * @param endTokens
     * @param nextTokens
     */
    private cleanup(e, endTokens, nextTokens);
    /**
     * Finds the specification for the @rule with @-keyword "atKeyword".
     * If no rule has been registered (in the global variable "atRules"),
     * null is returned.
     *
     * @param atKeyword
     * @returns {*}
     */
    private getAtRuleSpec(atKeyword);
}
