import T = require('./types');
import Tokenizer = require('./tokenizer');
export interface IComponentValue extends T.INode {
    getValue: () => string;
}
export interface IRulesContainer extends T.INode {
    getRules: () => RuleList;
}
export interface IASTWalker {
    (ast: T.INode, descend: () => any[], walker?: IASTWalker): any;
}
export interface IPosition {
    line: number;
    column: number;
}
/**
 * Determines whether the AST node "node" has a parent which is an instance of "ctor".
 *
 * @param node The AST node to examine
 * @param ctor The AST node class to find among the ancestors of "node"
 *
 * @returns {boolean}
 */
export declare function hasParent(node: T.INode, ctor: Function): boolean;
/**
 * Finds the closest ancestor of the AST node "node" which is an instanceof of "ctor".
 * If no parent class is provided, the immediate parent of "node" is returned.
 * If no such parent can be found, the function returns null.
 *
 * @param node The node whose parent to find
 * @param ctor The AST node class to find among the ancestors of "node"
 *
 * @returns {*}
 */
export declare function getParent(node: T.INode, ctor?: Function): T.INode;
/**
 * Converts an array of tokens to a string, normalizing whitespaces and removing comments.
 *
 * @param tokens The tokens to convert
 * @returns {string}
 */
export declare function toStringNormalize(tokens: Tokenizer.Token[]): string;
export declare class SourceRange implements T.ISourceRange {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    constructor(startLine?: number, startColumn?: number, endLine?: number, endColumn?: number);
}
export declare class ASTNode implements T.INode {
    range: SourceRange;
    _parent: T.INode;
    _hasError: boolean;
    _children: T.INode[];
    _tokens: Tokenizer.Token[];
    getParent(): T.INode;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    _walk(walker: IASTWalker, descend: () => any[]): any;
    hasError(): boolean;
    /**
     * Creates a string representation of this AST subtree matching the original
     * input as closely as possible.
     *
     * @returns {string}
     */
    toString(): string;
    errorTokensToString(): string;
    /**
     * Returns the AST's root node.
     */
    getRoot(): T.INode;
    /**
     * Determines whether this node is an ancestor of "node".
     */
    isAncestorOf(node: T.INode): boolean;
}
export declare class ASTNodeList<U extends T.INode> extends ASTNode {
    _nodes: U[];
    constructor(nodes: U[]);
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    /**
     * Returns the number of nodes in this list.
     *
     * @returns {number}
     */
    getLength(): number;
    getStartPosition(): IPosition;
    replaceNodes(nodes: U[]): void;
    /**
     * Inserts a new node at position "pos" or at the end if no position is provided.
     *
     * @param node The node to insert
     * @param pos The position at which to insert the node
     */
    insertNode(node: U, pos?: number): void;
    /**
     * Deletes the node at position "pos".
     * If there is no node at this position, no node is deleted.
     *
     * @param pos The position at which to delete the node
     */
    deleteNode(pos: number): void;
    /**
     * Deletes all nodes from the node list.
     */
    deleteAllNodes(): void;
    forEach(it: (elt: U) => void): void;
    toString(): string;
    walk(walker: IASTWalker): any;
    walkChildren(walker: IASTWalker, result?: any[]): any[];
}
export declare class ComponentValue extends ASTNode implements IComponentValue {
    private _token;
    constructor(token?: Tokenizer.Token);
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getToken(): Tokenizer.Token;
    getValue(): string;
    getType(): Tokenizer.EToken;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class ComponentValueList extends ASTNodeList<ComponentValue> implements IComponentValue {
    constructor(values: IComponentValue[]);
    getValue(): string;
}
export declare class BlockComponentValue extends ComponentValueList {
    private _startToken;
    private _endToken;
    constructor(startToken: Tokenizer.Token, endToken: Tokenizer.Token, values: IComponentValue[]);
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getStartToken(): Tokenizer.Token;
    getEndToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class FunctionComponentValue extends BlockComponentValue {
    constructor(name: Tokenizer.Token, rparen: Tokenizer.Token, args: IComponentValue[]);
    getName(): Tokenizer.Token;
    getArgs(): FunctionArgumentValue[];
}
export declare class FunctionArgumentValue extends ComponentValueList {
    private _separator;
    constructor(values: IComponentValue[], separator?: Tokenizer.Token);
    getTokens(): Tokenizer.Token[];
    getLastToken(): Tokenizer.Token;
    getChildren(): T.INode[];
    getSeparator(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class ImportantComponentValue extends ASTNode {
    private _exclamationMark;
    private _important;
    constructor(exclamationMark: Tokenizer.Token, important: Tokenizer.Token);
    getExclamationMark(): Tokenizer.Token;
    getImportant(): Tokenizer.Token;
    getTokens(): Tokenizer.Token[];
    getLastToken(): Tokenizer.Token;
    getChildren(): T.INode[];
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class AbstractRule extends ASTNode {
    id: string;
}
export declare class RuleList extends ASTNodeList<AbstractRule> {
    private _lbrace;
    private _rbrace;
    constructor(rules: AbstractRule[], lbrace?: Tokenizer.Token, rbrace?: Tokenizer.Token);
    static fromErrorTokens(tokens: Tokenizer.Token[]): RuleList;
    getStartPosition(): IPosition;
    insertRule(rule: AbstractRule, pos?: number): void;
    deleteRule(pos: number): void;
    deleteAllRules(): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getLBrace(): Tokenizer.Token;
    getRBrace(): Tokenizer.Token;
    removeBraces(): void;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class StyleSheet extends ASTNode implements IRulesContainer {
    private _rules;
    private _cdo;
    private _cdc;
    constructor(ruleList: RuleList, cdo?: Tokenizer.Token, cdc?: Tokenizer.Token);
    insertRule(rule: AbstractRule, pos?: number): void;
    deleteRule(pos: number): void;
    deleteAllRules(): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getRules(): RuleList;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class Rule extends AbstractRule {
    private _selectors;
    private _declarations;
    constructor(selectors?: SelectorList, declarations?: DeclarationList);
    static fromErrorTokens(tokens: Tokenizer.Token[]): Rule;
    setSelectors(selectors: SelectorList): void;
    insertSelector(selector: Selector, pos?: number): void;
    deleteSelector(pos: number): void;
    deleteAllSelectors(): void;
    insertDeclaration(declaration: Declaration, pos?: number): void;
    deleteDeclaration(pos: number): void;
    deleteAllDeclarations(): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getSelectors(): SelectorList;
    getDeclarations(): DeclarationList;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class SelectorList extends ASTNodeList<Selector> {
    constructor(selectors?: Selector[]);
    getSelector(index: number): Selector;
    setSelectors(selectors: Selector[]): void;
    setSelectors(selectors: SelectorList): void;
    insertSelector(selector: Selector, pos?: number): void;
    deleteSelector(pos: number): void;
    deleteAllSelectors(): void;
}
export declare class Selector extends ComponentValueList {
    private _separator;
    private _text;
    constructor(values: IComponentValue[], separator?: Tokenizer.Token);
    constructor(selectorText: string);
    static fromErrorTokens(tokens: Tokenizer.Token[]): Selector;
    addSeparator(): void;
    getText(): string;
    setText(newText: string): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getLastToken(): Tokenizer.Token;
    getSeparator(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class SelectorCombinator extends ComponentValue {
    getCombinator(): string;
    walk(walker: IASTWalker): any;
}
export declare class SimpleSelector<U extends T.INode> extends ASTNode implements IComponentValue {
    _value: U;
    _namespace: Tokenizer.Token;
    _pipe: Tokenizer.Token;
    constructor(value: U, namespace?: Tokenizer.Token, pipe?: Tokenizer.Token);
    getNamespace(): Tokenizer.Token;
    getPipe(): Tokenizer.Token;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
    getValue(): string;
}
export declare class TypeSelector extends SimpleSelector<Tokenizer.Token> {
    constructor(type: Tokenizer.Token, namespace?: Tokenizer.Token, pipe?: Tokenizer.Token);
    constructor(type: string, namespace?: string);
    getType(): Tokenizer.Token;
}
export declare class UniversalSelector extends SimpleSelector<Tokenizer.Token> {
    constructor(asterisk: Tokenizer.Token, namespace?: Tokenizer.Token, pipe?: Tokenizer.Token);
    constructor(namespace?: string);
    getType(): Tokenizer.Token;
}
export declare class AttributeSelector extends SimpleSelector<BlockComponentValue> {
    getAttribute(): BlockComponentValue;
}
export declare class ClassSelector extends SimpleSelector<Tokenizer.Token> {
    private _className;
    constructor(dot: Tokenizer.Token, className: Tokenizer.Token, namespace?: Tokenizer.Token, pipe?: Tokenizer.Token);
    constructor(className: string, namespace?: string);
    getClassName(): Tokenizer.Token;
    getDot(): Tokenizer.Token;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class IDSelector extends SimpleSelector<Tokenizer.Token> {
    constructor(id: Tokenizer.Token, namespace?: Tokenizer.Token, pipe?: Tokenizer.Token);
    constructor(id: string, namespace?: string);
    getID(): Tokenizer.Token;
}
export declare class PseudoClass extends ASTNode implements IComponentValue {
    private _colon1;
    private _colon2;
    private _pseudoClassName;
    constructor(colon1: Tokenizer.Token, colon2: Tokenizer.Token, pseudoClassName: IComponentValue);
    constructor(pseudoClass: string);
    getPseudoClassName(): IComponentValue;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
    getValue(): string;
    private set(colon1, colon2, value);
}
export declare class DeclarationList extends ASTNodeList<Declaration> {
    private _lbrace;
    private _rbrace;
    constructor(declarations: Declaration[], lbrace?: Tokenizer.Token, rbrace?: Tokenizer.Token);
    static fromErrorTokens(tokens: Tokenizer.Token[]): DeclarationList;
    insertDeclaration(declaration: Declaration, pos?: number): void;
    deleteDeclaration(pos: number): void;
    deleteAllDeclarations(): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    getLBrace(): Tokenizer.Token;
    getRBrace(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(excludeBraces?: boolean): string;
}
export declare class Declaration extends ASTNode {
    private _name;
    private _colon;
    private _value;
    private _semicolon;
    private _lcomment;
    private _rcomment;
    private _text;
    private _nameText;
    constructor(name: ComponentValueList, colon: Tokenizer.Token, value: DeclarationValue, semicolon: Tokenizer.Token, lcomment?: Tokenizer.Token, rcomment?: Tokenizer.Token);
    constructor(name: string, value: string, important?: boolean, disabled?: boolean);
    static fromErrorTokens(tokens: Tokenizer.Token[], name?: ComponentValueList, colon?: Tokenizer.Token): Declaration;
    setName(newName: string): void;
    getName(): ComponentValueList;
    getNameAsString(): string;
    getColon(): Tokenizer.Token;
    getValue(): DeclarationValue;
    getValueAsString(excludeImportant?: boolean): string;
    setValue(newValue: string): void;
    getSemicolon(): Tokenizer.Token;
    getLComment(): Tokenizer.Token;
    getRComment(): Tokenizer.Token;
    getDisabled(): boolean;
    setDisabled(isDisabled: boolean): void;
    getImportant(): boolean;
    getText(): string;
    setText(newText: string): void;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
    private set(name, colon, value, semicolon, lcomment?, rcomment?);
}
export declare class DeclarationValue extends ComponentValueList {
    private _text;
    private _textWithoutImportant;
    constructor(values: IComponentValue[]);
    getText(excludeImportant?: boolean): string;
    setText(value: string): void;
    getImportant(): boolean;
    toString(excludeImportant?: boolean): string;
}
export declare class AtRule extends AbstractRule implements IRulesContainer {
    private _atKeyword;
    private _prelude;
    private _block;
    private _semicolon;
    constructor(atKeyword: Tokenizer.Token, prelude?: ComponentValueList, blockOrSemicolon?: T.INode);
    getAtKeyword(): Tokenizer.Token;
    getPrelude(): ComponentValueList;
    getDeclarations(): DeclarationList;
    getRules(): RuleList;
    getSemicolon(): Tokenizer.Token;
    getChildren(): T.INode[];
    getTokens(): Tokenizer.Token[];
    getFirstToken(): Tokenizer.Token;
    getLastToken(): Tokenizer.Token;
    walk(walker: IASTWalker): any;
    toString(): string;
}
export declare class AtCharset extends AtRule {
    private _charset;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, semicolon: Tokenizer.Token);
    constructor(charset: string);
    getCharset(): string;
}
export declare class AtCustomMedia extends AtRule {
    private _extensionName;
    private _media;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, semicolon: Tokenizer.Token);
    constructor(extensionName: string, media: string);
    getExtensionName(): string;
    getMedia(): ComponentValueList;
    private getExtensionNameAndMedia();
}
export declare class AtDocument extends AtRule {
    private _url;
    private _urlPrefix;
    private _domain;
    private _regexp;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, block: RuleList);
    constructor(prelude: string, rules: RuleList);
    getUrl(): string;
    getUrlPrefix(): string;
    getDomain(): string;
    getRegexp(): string;
}
export declare class AtFontFace extends AtRule {
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, declarations: DeclarationList);
    constructor(declarations: DeclarationList);
}
export declare class AtHost extends AtRule {
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, rules: RuleList);
    constructor(rules: RuleList);
}
export declare class AtImport extends AtRule {
    private _url;
    private _media;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, semicolon: Tokenizer.Token);
    constructor(url: string, media?: string);
    getUrl(): string;
    getMedia(): ComponentValueList;
}
export declare class AtKeyframes extends AtRule {
    private _animationName;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, rules: RuleList);
    constructor(animationName: string, rules: RuleList);
    getAnimationName(): string;
}
export declare class AtMedia extends AtRule {
    private _media;
    constructor(atKeyword: Tokenizer.Token, media: ComponentValueList, rules: RuleList);
    constructor(media: string, rules: RuleList);
    getMedia(): ComponentValueList;
}
export declare class AtNamespace extends AtRule {
    private _url;
    private _prefix;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, semicolon: Tokenizer.Token);
    constructor(url: string, prefix?: string);
    getUrl(): string;
    getPrefix(): string;
    private getPrefixAndUrl();
}
export declare class AtPage extends AtRule {
    private _pseudoClass;
    constructor(atKeyword: Tokenizer.Token, prelude: ComponentValueList, declarations: DeclarationList);
    constructor(pseudoClass: string, declarations: DeclarationList);
    getPseudoClass(): ComponentValueList;
}
export declare class AtSupports extends AtRule {
    private _supports;
    constructor(atKeyword: Tokenizer.Token, supports: ComponentValueList, rules: RuleList);
    constructor(supports: string, rules: RuleList);
    getSupports(): ComponentValueList;
}
