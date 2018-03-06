// ==================================================================
// IMPORT MODULES
// ==================================================================
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Tokenizer = require('./tokenizer');
var Parser = require('./parser');
var Utilities = require('./utilities');
// ==================================================================
// HELPER FUNCTIONS
// ==================================================================
function setRangeFromChildren(range, children) {
    var len, firstChildRange, lastChildRange;
    if (!children)
        return;
    len = children.length;
    if (len === 0)
        return;
    firstChildRange = children[0].range;
    lastChildRange = children[len - 1].range;
    range.startLine = firstChildRange.startLine;
    range.startColumn = firstChildRange.startColumn;
    range.endLine = lastChildRange.endLine;
    range.endColumn = lastChildRange.endColumn;
}
/**
 * Determines whether the AST node "node" has a parent which is an instance of "ctor".
 *
 * @param node The AST node to examine
 * @param ctor The AST node class to find among the ancestors of "node"
 *
 * @returns {boolean}
 */
function hasParent(node, ctor) {
    var parent = node;
    for (; parent;) {
        parent = parent.getParent();
        if (!parent)
            return false;
        if (parent instanceof ctor)
            return true;
    }
    return false;
}
exports.hasParent = hasParent;
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
function getParent(node, ctor) {
    var parent = node;
    for (;;) {
        parent = parent.getParent();
        if (!parent)
            return null;
        if (!ctor || (parent instanceof ctor))
            return parent;
    }
}
exports.getParent = getParent;
/**
 * Converts an array of tokens to a string, normalizing whitespaces and removing comments.
 *
 * @param tokens The tokens to convert
 * @returns {string}
 */
function toStringNormalize(tokens) {
    var s = '', len, i, token;
    if (!tokens)
        return '';
    len = tokens.length;
    for (i = 0; i < len; i++) {
        token = tokens[i];
        if (i > 0 && token.hasLeadingWhitespace())
            s += ' ';
        s += token.src;
        if (i < len - 1 && token.hasTrailingWhitespace())
            s += ' ';
    }
    return Utilities.trim(s);
}
exports.toStringNormalize = toStringNormalize;
function trailingWhitespace(token, range) {
    token.trailingTrivia = [
        new Tokenizer.Token(Tokenizer.EToken.WHITESPACE, range || new SourceRange(), ' ')
    ];
    token._children = null;
    return token;
}
// ==================================================================
// AST CLASSES
// ==================================================================
var SourceRange = (function () {
    function SourceRange(startLine, startColumn, endLine, endColumn) {
        if (startLine === void 0) { startLine = 0; }
        if (startColumn === void 0) { startColumn = 0; }
        if (endLine === void 0) { endLine = 0; }
        if (endColumn === void 0) { endColumn = 0; }
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
    return SourceRange;
})();
exports.SourceRange = SourceRange;
var ASTNode = (function () {
    function ASTNode() {
        this.range = new SourceRange();
        /* protected */ this._parent = null;
        /* protected */ this._children = null;
        /* protected */ this._tokens = null;
    }
    ASTNode.prototype.getParent = function () {
        return this._parent;
    };
    ASTNode.prototype.getChildren = function () {
        if (this._children === null)
            this._children = [];
        return this._children;
    };
    ASTNode.prototype.getTokens = function () {
        if (this._tokens === null)
            this._tokens = [];
        return this._tokens;
    };
    ASTNode.prototype.getFirstToken = function () {
        return null;
    };
    ASTNode.prototype.getLastToken = function () {
        return null;
    };
    ASTNode.prototype.walk = function (walker) {
        return walker(this, function () { return undefined; }, walker);
    };
    ASTNode.prototype._walk = function (walker, descend) {
        // walk the node and call descend if undefined was returned
        var ret = walker(this, descend, walker);
        return ret !== undefined ? ret : descend();
    };
    ASTNode.prototype.hasError = function () {
        return this._hasError;
    };
    /**
     * Creates a string representation of this AST subtree matching the original
     * input as closely as possible.
     *
     * @returns {string}
     */
    ASTNode.prototype.toString = function () {
        return '';
    };
    ASTNode.prototype.errorTokensToString = function () {
        var s = '', tokens, len, i;
        if (!this._hasError)
            return '';
        tokens = this.getTokens();
        len = tokens.length;
        for (i = 0; i < len; i++)
            s += tokens[i].toString();
        return s;
    };
    /**
     * Returns the AST's root node.
     */
    ASTNode.prototype.getRoot = function () {
        var node, parent;
        for (node = this;;) {
            parent = node.getParent();
            if (parent === null)
                return node;
            node = parent;
        }
    };
    /**
     * Determines whether this node is an ancestor of "node".
     */
    ASTNode.prototype.isAncestorOf = function (node) {
        var parent;
        for (parent = node.getParent(); parent; parent = parent.getParent())
            if (this === parent)
                return true;
        return false;
    };
    return ASTNode;
})();
exports.ASTNode = ASTNode;
var ASTNodeList = (function (_super) {
    __extends(ASTNodeList, _super);
    function ASTNodeList(nodes) {
        var i, len, node;
        _super.call(this);
        this._nodes = nodes;
        if (this._nodes) {
            len = this._nodes.length;
            for (i = 0; i < len; i++) {
                node = this._nodes[i];
                // set the parent
                if (node instanceof ASTNode)
                    node._parent = this;
                else if (node instanceof Tokenizer.Token)
                    node.parent = this;
                this[i] = node;
            }
            if (len > 0)
                setRangeFromChildren(this.range, this._nodes);
        }
    }
    ASTNodeList.prototype.getChildren = function () {
        return this._nodes;
    };
    ASTNodeList.prototype.getTokens = function () {
        var s, len, lenTokens, i, j;
        if (this._tokens === null) {
            this._tokens = [];
            len = (this._nodes && this._nodes.length) || 0;
            for (i = 0; i < len; i++) {
                s = this._nodes[i].getTokens();
                lenTokens = s.length;
                for (j = 0; j < lenTokens; j++)
                    this._tokens.push(s[j]);
            }
        }
        return this._tokens;
    };
    ASTNodeList.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        if (!this._nodes || this._nodes.length === 0)
            return null;
        var firstNode = this._nodes[0];
        if (firstNode instanceof Tokenizer.Token)
            return firstNode;
        if (firstNode instanceof ASTNode)
            return firstNode.getFirstToken();
        return null;
    };
    ASTNodeList.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (!this._nodes)
            return null;
        var len = this._nodes.length;
        if (len === 0)
            return null;
        var lastNode = this._nodes[len - 1];
        if (lastNode instanceof Tokenizer.Token)
            return lastNode;
        if (lastNode instanceof ASTNode)
            return lastNode.getLastToken();
        return null;
    };
    /**
     * Returns the number of nodes in this list.
     *
     * @returns {number}
     */
    ASTNodeList.prototype.getLength = function () {
        return this._nodes ? this._nodes.length : 0;
    };
    ASTNodeList.prototype.getStartPosition = function () {
        return { line: this.range.startLine, column: this.range.startColumn };
    };
    ASTNodeList.prototype.replaceNodes = function (nodes) {
        var offsetLine, offsetColumn, range, pos, root = this.getRoot(), len = nodes.length, i, node, virtualNode, firstRange, lastRange;
        if (this._nodes && this._nodes.length > 0) {
            range = this._nodes[0].range;
            offsetLine = range.startLine;
            offsetColumn = range.startColumn;
        }
        else {
            pos = this.getStartPosition();
            offsetLine = pos.line;
            offsetColumn = pos.column;
        }
        if (!this._nodes)
            this._nodes = [];
        // delete all the current nodes
        this.deleteAllNodes();
        // adjust the ranges of the nodes
        for (i = 0; i < len; i++) {
            node = nodes[i];
            Utilities.offsetRange(node, offsetLine - node.range.startLine, offsetColumn - node.range.startColumn);
            offsetLine = node.range.endLine;
            offsetColumn = node.range.endColumn;
        }
        // adjust the ranges in the AST
        firstRange = nodes[0].range;
        lastRange = nodes[len - 1].range;
        virtualNode = new ASTNode();
        virtualNode._parent = this;
        virtualNode.range = new SourceRange(firstRange.startLine, firstRange.startColumn, lastRange.endLine, lastRange.endColumn);
        Utilities.insertRangeFromNode(root, virtualNode);
        // insert the nodes into the collection
        for (i = 0; i < len; i++) {
            node = nodes[i];
            // add the node to the collection and add the node references
            this._nodes.push(node);
            this[i] = node;
            // set the parent
            if (node instanceof ASTNode)
                node._parent = this;
            else if (node instanceof Tokenizer.Token)
                node.parent = this;
        }
    };
    /**
     * Inserts a new node at position "pos" or at the end if no position is provided.
     *
     * @param node The node to insert
     * @param pos The position at which to insert the node
     */
    ASTNodeList.prototype.insertNode = function (node, pos) {
        var nodes = this._nodes, len = (nodes && nodes.length) || 0, i, range, position, offsetLine, offsetColumn;
        if (!this._nodes)
            nodes = this._nodes = [];
        // set the parent of the node to insert
        if (node instanceof ASTNode)
            node._parent = this;
        else if (node instanceof Tokenizer.Token)
            node.parent = this;
        // insert the node into the collection
        if (pos === undefined)
            pos = len;
        else {
            if (pos < 0)
                pos = 0;
            if (pos > len)
                pos = len;
        }
        // find the line/column offset
        if (len === 0) {
            position = this.getStartPosition();
            offsetLine = position.line;
            offsetColumn = position.column;
        }
        else if (pos === 0) {
            range = nodes[0].range;
            offsetLine = range.startLine;
            offsetColumn = range.startColumn;
        }
        else {
            range = nodes[pos - 1].range;
            offsetLine = range.endLine;
            offsetColumn = range.endColumn;
        }
        // insert the new node and update the node references
        nodes.splice(pos, 0, node);
        for (i = pos; i < len + 1; i++)
            this[i] = nodes[i];
        // update the ranges
        Utilities.offsetRange(node, offsetLine - node.range.startLine, offsetColumn - node.range.startColumn);
        Utilities.insertRangeFromNode(this.getRoot(), node);
        // recompute tokens and children
        this._tokens = null;
        this._children = null;
    };
    /**
     * Deletes the node at position "pos".
     * If there is no node at this position, no node is deleted.
     *
     * @param pos The position at which to delete the node
     */
    ASTNodeList.prototype.deleteNode = function (pos) {
        var nodes = this._nodes, len = (nodes && nodes.length) || 0, i, node;
        if (0 <= pos && pos < len) {
            // remove the node from the collection
            node = nodes[pos];
            nodes.splice(pos, 1);
            // update the references
            for (i = pos; i < len - 1; i++)
                this[i] = nodes[i];
            this[len - 1] = undefined;
            // update the ranges
            Utilities.zeroRange(this.getRoot(), node);
            // recompute tokens and children
            this._tokens = null;
            this._children = null;
        }
    };
    /**
     * Deletes all nodes from the node list.
     */
    ASTNodeList.prototype.deleteAllNodes = function () {
        var nodes = this._nodes, len = (nodes && nodes.length) || 0, i, firstRange, lastRange, range;
        // nothing to do if there are no nodes
        if (len === 0)
            return;
        // construct the range to delete
        firstRange = nodes[0].range;
        lastRange = nodes[len - 1].range;
        range = {
            startLine: firstRange.startLine,
            startColumn: firstRange.startColumn,
            endLine: lastRange.endLine,
            endColumn: lastRange.endColumn
        };
        // remove the nodes
        nodes.splice(0, len);
        // remove the references
        for (i = 0; i < len; i++)
            this[i] = undefined;
        // update the ranges
        Utilities.zeroRange(this.getRoot(), range);
        this._tokens = null;
        this._children = null;
    };
    ASTNodeList.prototype.forEach = function (it) {
        var i, len = (this._nodes && this._nodes.length) || 0;
        for (i = 0; i < len; i++)
            it(this._nodes[i]);
    };
    ASTNodeList.prototype.toString = function () {
        var s = '', nodes, len, i;
        if (this._hasError)
            return this.errorTokensToString();
        nodes = this._nodes;
        if (nodes) {
            len = nodes.length;
            for (i = 0; i < len; i++)
                s += nodes[i].toString();
        }
        return s;
    };
    ASTNodeList.prototype.walk = function (walker) {
        var that = this;
        return walker(this, function () {
            return that.walkChildren(walker);
        }, walker) || this.walkChildren(walker);
    };
    ASTNodeList.prototype.walkChildren = function (walker, result) {
        if (result === void 0) { result = []; }
        var r, len, i;
        if (this._nodes) {
            len = this._nodes.length;
            for (i = 0; i < len; i++) {
                r = this._nodes[i].walk(walker);
                if (r !== undefined)
                    result.push(r);
            }
        }
        return result;
    };
    return ASTNodeList;
})(ASTNode);
exports.ASTNodeList = ASTNodeList;
var ComponentValue = (function (_super) {
    __extends(ComponentValue, _super);
    function ComponentValue(token) {
        _super.call(this);
        this._token = token;
        if (token) {
            this.range.startLine = token.range.startLine;
            this.range.startColumn = token.range.startColumn;
            this.range.endLine = token.range.endLine;
            this.range.endColumn = token.range.endColumn;
            this._token.parent = this;
        }
    }
    ComponentValue.prototype.getChildren = function () {
        if (this._children === null)
            this._children = [this._token];
        return this._children;
    };
    ComponentValue.prototype.getTokens = function () {
        if (this._tokens === null)
            this._tokens = [this._token];
        return this._tokens;
    };
    ComponentValue.prototype.getFirstToken = function () {
        return this._token;
    };
    ComponentValue.prototype.getLastToken = function () {
        return this._token;
    };
    ComponentValue.prototype.getToken = function () {
        return this._token;
    };
    ComponentValue.prototype.getValue = function () {
        return this._token.value || this._token.src;
    };
    ComponentValue.prototype.getType = function () {
        return this._token.token;
    };
    ComponentValue.prototype.walk = function (walker) {
        return this._token.walk(walker);
    };
    ComponentValue.prototype.toString = function () {
        return this._token.toString();
    };
    return ComponentValue;
})(ASTNode);
exports.ComponentValue = ComponentValue;
var ComponentValueList = (function (_super) {
    __extends(ComponentValueList, _super);
    function ComponentValueList(values) {
        _super.call(this, values);
    }
    ComponentValueList.prototype.getValue = function () {
        return this.toString();
    };
    return ComponentValueList;
})(ASTNodeList);
exports.ComponentValueList = ComponentValueList;
var BlockComponentValue = (function (_super) {
    __extends(BlockComponentValue, _super);
    function BlockComponentValue(startToken, endToken, values) {
        _super.call(this, values);
        this._startToken = startToken;
        this._endToken = endToken;
        if (this._startToken) {
            this._startToken.parent = this;
            this.range.startLine = this._startToken.range.startLine;
            this.range.startColumn = this._startToken.range.startColumn;
        }
        if (this._endToken) {
            this._endToken.parent = this;
            this.range.endLine = this._endToken.range.endLine;
            this.range.endColumn = this._endToken.range.endColumn;
        }
    }
    BlockComponentValue.prototype.getChildren = function () {
        var children;
        if (this._children === null) {
            children = _super.prototype.getChildren.call(this);
            this._children = children ? children.slice(0) : [];
            if (this._startToken)
                this._children.unshift(this._startToken);
            if (this._endToken)
                this._children.push(this._endToken);
        }
        return this._children;
    };
    BlockComponentValue.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (!this._tokens)
                this._tokens = [];
            this._tokens.unshift(this._startToken);
            this._tokens.push(this._endToken);
        }
        return this._tokens;
    };
    BlockComponentValue.prototype.getFirstToken = function () {
        if (this._startToken)
            return this._startToken;
        if (this._endToken)
            return this._endToken;
        return null;
    };
    BlockComponentValue.prototype.getLastToken = function () {
        if (this._endToken)
            return this._endToken;
        if (this._startToken)
            return this._startToken;
        return null;
    };
    BlockComponentValue.prototype.getStartToken = function () {
        return this._startToken;
    };
    BlockComponentValue.prototype.getEndToken = function () {
        return this._endToken;
    };
    BlockComponentValue.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if ((r = that._startToken.walk(walker)) !== undefined)
                result.push(r);
            that.walkChildren(walker, result);
            if ((r = that._endToken.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    BlockComponentValue.prototype.toString = function () {
        if (this._hasError)
            return this.errorTokensToString();
        return this._startToken.toString() + _super.prototype.toString.call(this) + this._endToken.toString();
    };
    return BlockComponentValue;
})(ComponentValueList);
exports.BlockComponentValue = BlockComponentValue;
var FunctionComponentValue = (function (_super) {
    __extends(FunctionComponentValue, _super);
    function FunctionComponentValue(name, rparen, args) {
        _super.call(this, name, rparen, args);
    }
    FunctionComponentValue.prototype.getName = function () {
        return this.getStartToken();
    };
    FunctionComponentValue.prototype.getArgs = function () {
        return this._nodes;
    };
    return FunctionComponentValue;
})(BlockComponentValue);
exports.FunctionComponentValue = FunctionComponentValue;
var FunctionArgumentValue = (function (_super) {
    __extends(FunctionArgumentValue, _super);
    function FunctionArgumentValue(values, separator) {
        _super.call(this, values);
        this._separator = separator;
        if (this._separator) {
            this._separator.parent = this;
            if (!values || values.length === 0) {
                this.range.startLine = this._separator.range.startLine;
                this.range.startColumn = this._separator.range.startColumn;
            }
            this.range.endLine = this._separator.range.endLine;
            this.range.endColumn = this._separator.range.endColumn;
        }
    }
    FunctionArgumentValue.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (this._separator)
                this._tokens.push(this._separator);
        }
        return this._tokens;
    };
    FunctionArgumentValue.prototype.getLastToken = function () {
        if (this._separator)
            return this._separator;
        return _super.prototype.getLastToken.call(this);
    };
    FunctionArgumentValue.prototype.getChildren = function () {
        var children;
        if (this._children === null) {
            children = _super.prototype.getChildren.call(this);
            this._children = children ? children.slice(0) : [];
            if (this._separator)
                this._children.push(this._separator);
        }
        return this._children;
    };
    FunctionArgumentValue.prototype.getSeparator = function () {
        return this._separator;
    };
    FunctionArgumentValue.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            that.walkChildren(walker, result);
            if (that._separator && (r = that._separator.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    FunctionArgumentValue.prototype.toString = function () {
        var s = _super.prototype.toString.call(this);
        if (!this._hasError && this._separator)
            s += this._separator.toString();
        return s;
    };
    return FunctionArgumentValue;
})(ComponentValueList);
exports.FunctionArgumentValue = FunctionArgumentValue;
var ImportantComponentValue = (function (_super) {
    __extends(ImportantComponentValue, _super);
    function ImportantComponentValue(exclamationMark, important) {
        var t;
        _super.call(this);
        this._exclamationMark = exclamationMark;
        this._important = important;
        if (this._exclamationMark)
            this._exclamationMark.parent = this;
        if (this._important)
            this._important.parent = this;
        t = exclamationMark || important;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = important || exclamationMark;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    }
    ImportantComponentValue.prototype.getExclamationMark = function () {
        return this._exclamationMark;
    };
    ImportantComponentValue.prototype.getImportant = function () {
        return this._important;
    };
    ImportantComponentValue.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._exclamationMark)
                this._tokens.push(this._exclamationMark);
            if (this._important)
                this._tokens.push(this._important);
        }
        return this._tokens;
    };
    ImportantComponentValue.prototype.getLastToken = function () {
        if (this._important)
            return this._important;
        if (this._exclamationMark)
            return this._exclamationMark;
        return _super.prototype.getLastToken.call(this);
    };
    ImportantComponentValue.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._exclamationMark)
                this._children.push(this._exclamationMark);
            if (this._important)
                this._children.push(this._important);
        }
        return this._children;
    };
    ImportantComponentValue.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._exclamationMark && (r = that._exclamationMark.walk(walker)) !== undefined)
                result.push(r);
            if (that._important && (r = that._important.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    ImportantComponentValue.prototype.toString = function () {
        var s;
        if (this._hasError)
            return this.errorTokensToString();
        s = '';
        if (this._exclamationMark)
            s += this._exclamationMark.toString();
        if (this._important)
            s += this._important.toString();
        return s;
    };
    return ImportantComponentValue;
})(ASTNode);
exports.ImportantComponentValue = ImportantComponentValue;
var AbstractRule = (function (_super) {
    __extends(AbstractRule, _super);
    function AbstractRule() {
        _super.apply(this, arguments);
    }
    return AbstractRule;
})(ASTNode);
exports.AbstractRule = AbstractRule;
var RuleList = (function (_super) {
    __extends(RuleList, _super);
    function RuleList(rules, lbrace, rbrace) {
        _super.call(this, rules);
        // TODO: adjust source ranges
        this._lbrace = lbrace !== undefined ? lbrace : new Tokenizer.Token(Tokenizer.EToken.LBRACE, new SourceRange(), '{');
        this._rbrace = rbrace !== undefined ? rbrace : new Tokenizer.Token(Tokenizer.EToken.RBRACE, new SourceRange(), '}');
        if (this._lbrace)
            this._lbrace.parent = this;
        if (this._rbrace)
            this._rbrace.parent = this;
        if (lbrace) {
            this.range.startLine = lbrace.range.startLine;
            this.range.startColumn = lbrace.range.startColumn;
        }
        if (rbrace) {
            this.range.endLine = rbrace.range.endLine;
            this.range.endColumn = rbrace.range.endColumn;
        }
    }
    RuleList.fromErrorTokens = function (tokens) {
        var ruleList = new RuleList([]);
        ruleList._tokens = tokens;
        ruleList._children = tokens;
        ruleList._hasError = true;
        setRangeFromChildren(ruleList.range, tokens);
        return ruleList;
    };
    RuleList.prototype.getStartPosition = function () {
        if (this._lbrace)
            return { line: this._lbrace.range.endLine, column: this._lbrace.range.endColumn };
        return _super.prototype.getStartPosition.call(this);
    };
    RuleList.prototype.insertRule = function (rule, pos) {
        this.insertNode(rule, pos);
    };
    RuleList.prototype.deleteRule = function (pos) {
        this.deleteNode(pos);
    };
    RuleList.prototype.deleteAllRules = function () {
        this.deleteAllNodes();
    };
    RuleList.prototype.getChildren = function () {
        var children;
        if (this._children === null) {
            children = _super.prototype.getChildren.call(this);
            this._children = children ? children.slice(0) : [];
            if (this._lbrace)
                this._children.unshift(this._lbrace);
            if (this._rbrace)
                this._children.push(this._rbrace);
        }
        return this._children;
    };
    RuleList.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (!this._tokens)
                this._tokens = [];
            if (this._lbrace)
                this._tokens.unshift(this._lbrace);
            if (this._rbrace)
                this._tokens.push(this._rbrace);
        }
        return this._tokens;
    };
    RuleList.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        if (this._lbrace)
            return this._lbrace;
        return _super.prototype.getFirstToken.call(this);
    };
    RuleList.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (this._rbrace)
            return this._rbrace;
        return _super.prototype.getLastToken.call(this);
    };
    RuleList.prototype.getLBrace = function () {
        return this._lbrace;
    };
    RuleList.prototype.getRBrace = function () {
        return this._rbrace;
    };
    RuleList.prototype.removeBraces = function () {
        var root = this.getRoot();
        if (this._lbrace)
            Utilities.zeroRange(root, this._lbrace);
        if (this._rbrace)
            Utilities.zeroRange(root, this._rbrace);
        this._lbrace = null;
        this._rbrace = null;
    };
    RuleList.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._lbrace && (r = that._lbrace.walk(walker)) !== undefined)
                result.push(r);
            that.walkChildren(walker, result);
            if (that._rbrace && (r = that._rbrace.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    RuleList.prototype.toString = function () {
        var s = _super.prototype.toString.call(this);
        if (!this._hasError) {
            if (this._lbrace)
                s = this._lbrace.toString() + s;
            if (this._rbrace)
                s += this._rbrace.toString();
        }
        return s;
    };
    return RuleList;
})(ASTNodeList);
exports.RuleList = RuleList;
var StyleSheet = (function (_super) {
    __extends(StyleSheet, _super);
    function StyleSheet(ruleList, cdo, cdc) {
        var t;
        _super.call(this);
        this._rules = ruleList;
        this._rules._parent = this;
        this._rules.removeBraces();
        this._cdo = cdo;
        this._cdc = cdc;
        if (this._cdo)
            this._cdo.parent = this;
        if (this._cdc)
            this._cdc.parent = this;
        t = cdo || ruleList || cdc;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = cdc || ruleList || cdo;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    }
    StyleSheet.prototype.insertRule = function (rule, pos) {
        this._rules.insertRule(rule, pos);
    };
    StyleSheet.prototype.deleteRule = function (pos) {
        this._rules.deleteRule(pos);
    };
    StyleSheet.prototype.deleteAllRules = function () {
        this._rules.deleteAllRules();
    };
    StyleSheet.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._cdo)
                this._children.push(this._cdo);
            if (this._rules)
                this._children.push(this._rules);
            if (this._cdc)
                this._children.push(this._cdc);
        }
        return this._children;
    };
    StyleSheet.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._cdo)
                this._tokens.push(this._cdo);
            if (this._rules)
                this._tokens = this._tokens.concat(this._rules.getTokens());
            if (this._cdc)
                this._tokens.push(this._cdc);
        }
        return this._tokens;
    };
    StyleSheet.prototype.getFirstToken = function () {
        if (this._cdo)
            return this._cdo;
        if (this._rules)
            return this._rules.getFirstToken();
        if (this._cdc)
            return this._cdc;
        return null;
    };
    StyleSheet.prototype.getLastToken = function () {
        if (this._cdc)
            return this._cdc;
        if (this._rules)
            return this._rules.getLastToken();
        if (this._cdo)
            return this._cdo;
        return null;
    };
    StyleSheet.prototype.getRules = function () {
        return this._rules;
    };
    StyleSheet.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._cdo && (r = that._cdo.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._rules && (r = that._rules.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._cdc && (r = that._cdc.walk(walker)) !== undefined)
                result = result.concat(r);
            return result;
        });
    };
    StyleSheet.prototype.toString = function () {
        var s = '';
        if (this._hasError)
            return this.errorTokensToString();
        if (this._cdo)
            s += this._cdo.toString();
        if (this._rules)
            s += this._rules.toString();
        if (this._cdc)
            s += this._cdc.toString();
        return s;
    };
    return StyleSheet;
})(ASTNode);
exports.StyleSheet = StyleSheet;
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule(selectors, declarations) {
        var t;
        _super.call(this);
        this._selectors = selectors;
        this._declarations = declarations;
        // set parents
        if (this._selectors)
            this._selectors._parent = this;
        if (this._declarations)
            this._declarations._parent = this;
        // set range
        t = selectors || declarations;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = declarations || selectors;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    }
    Rule.fromErrorTokens = function (tokens) {
        var rule = new Rule();
        rule._tokens = tokens;
        rule._children = tokens;
        rule._hasError = true;
        setRangeFromChildren(rule.range, tokens);
        return rule;
    };
    Rule.prototype.setSelectors = function (selectors) {
        if (this._selectors)
            this._selectors.setSelectors(selectors._nodes);
    };
    Rule.prototype.insertSelector = function (selector, pos) {
        if (this._selectors)
            this._selectors.insertSelector(selector, pos);
    };
    Rule.prototype.deleteSelector = function (pos) {
        if (this._selectors)
            this._selectors.deleteSelector(pos);
    };
    Rule.prototype.deleteAllSelectors = function () {
        if (this._selectors)
            this._selectors.deleteAllSelectors();
    };
    Rule.prototype.insertDeclaration = function (declaration, pos) {
        if (this._declarations)
            this._declarations.insertDeclaration(declaration, pos);
    };
    Rule.prototype.deleteDeclaration = function (pos) {
        if (this._declarations)
            this._declarations.deleteDeclaration(pos);
    };
    Rule.prototype.deleteAllDeclarations = function () {
        if (this._declarations)
            this._declarations.deleteAllDeclarations();
    };
    Rule.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._selectors)
                this._children.push(this._selectors);
            if (this._declarations)
                this._children.push(this._declarations);
        }
        return this._children;
    };
    Rule.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._selectors)
                this._tokens = this._tokens.concat(this._selectors.getTokens());
            if (this._declarations)
                this._tokens = this._tokens.concat(this._declarations.getTokens());
        }
        return this._tokens;
    };
    Rule.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        if (this._selectors)
            return this._selectors.getFirstToken();
        if (this._declarations)
            return this._declarations.getFirstToken();
        return null;
    };
    Rule.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (this._declarations)
            return this._declarations.getLastToken();
        if (this._selectors)
            return this._selectors.getLastToken();
        return null;
    };
    Rule.prototype.getSelectors = function () {
        return this._selectors;
    };
    Rule.prototype.getDeclarations = function () {
        return this._declarations;
    };
    Rule.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._selectors && (r = that._selectors.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._declarations && (r = that._declarations.walk(walker)) !== undefined)
                result = result.concat(r);
            return result;
        });
    };
    Rule.prototype.toString = function () {
        var s = '';
        if (this._hasError)
            return this.errorTokensToString();
        if (this._selectors)
            s += this._selectors.toString();
        if (this._declarations)
            s += this._declarations.toString();
        return s;
    };
    return Rule;
})(AbstractRule);
exports.Rule = Rule;
var SelectorList = (function (_super) {
    __extends(SelectorList, _super);
    function SelectorList(selectors) {
        _super.call(this, selectors || []);
        var len, i, selector;
        // add separators to the selectors which don't have one (except for the last one)
        if (selectors) {
            len = selectors.length;
            for (i = 0; i < len - 1; i++) {
                selector = selectors[i];
                if (!selector.getSeparator())
                    selector.addSeparator();
            }
        }
    }
    SelectorList.prototype.getSelector = function (index) {
        return this._nodes[index];
    };
    SelectorList.prototype.setSelectors = function (selectors) {
        var len, i, selector;
        if (Array.isArray(selectors)) {
            // make sure there are separators
            len = selectors.length;
            for (i = 0; i < len - 1; i++) {
                selector = selectors[i];
                if (!selector.getSeparator())
                    selector.addSeparator();
            }
            this.replaceNodes(selectors);
        }
        else if (selectors instanceof SelectorList)
            this.replaceNodes(selectors._nodes);
    };
    SelectorList.prototype.insertSelector = function (selector, pos) {
        var len = this.getLength(), prevSelector;
        // check if the selector needs a separator (i.e., if the selector is
        // inserted into a non-empty list (not at the end of the list)
        if (!selector.getSeparator() && (len > 0 && pos !== undefined && pos < len))
            selector.addSeparator();
        // add a separator to the selector preceding the one to be inserted if it doesn't have one already
        if (len > 0 && (pos === undefined || pos > 0)) {
            prevSelector = this._nodes[pos === undefined ? len - 1 : pos - 1];
            if (prevSelector && !prevSelector.getSeparator())
                prevSelector.addSeparator();
        }
        this.insertNode(selector, pos);
    };
    SelectorList.prototype.deleteSelector = function (pos) {
        this.deleteNode(pos);
    };
    SelectorList.prototype.deleteAllSelectors = function () {
        this.deleteAllNodes();
    };
    return SelectorList;
})(ASTNodeList);
exports.SelectorList = SelectorList;
var Selector = (function (_super) {
    __extends(Selector, _super);
    function Selector() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        _super.call(this, typeof args[0] === 'string' ? (new Parser.Parser(args[0]).parseComponentValueList()) : args[0]);
        this._text = null;
        if (args.length >= 1 && args[1] instanceof Tokenizer.Token) {
            this._separator = args[1];
            if (this._separator) {
                this._separator.parent = this;
                if (!this._nodes || this._nodes.length === 0) {
                    this.range.startLine = this._separator.range.startLine;
                    this.range.startColumn = this._separator.range.startColumn;
                }
                this.range.endLine = this._separator.range.endLine;
                this.range.endColumn = this._separator.range.endColumn;
            }
        }
    }
    Selector.fromErrorTokens = function (tokens) {
        var selector = new Selector(null);
        selector._tokens = tokens;
        selector._children = tokens;
        selector._hasError = true;
        setRangeFromChildren(selector.range, tokens);
        return selector;
    };
    Selector.prototype.addSeparator = function () {
        var line, column, separator, root = this.getRoot(), tokens, lenTokens, lastToken, trivia, len, i, token;
        if (this._separator)
            return;
        // move the trailing trivia
        tokens = this._nodes[this._nodes.length - 1].getTokens();
        if (tokens && ((lenTokens = tokens.length) > 0) && tokens[lenTokens - 1].trailingTrivia) {
            // remove the trivia
            lastToken = tokens[lenTokens - 1];
            trivia = lastToken.trailingTrivia;
            lastToken.trailingTrivia = undefined;
            lastToken._children = null;
            // update the ranges
            len = trivia.length;
            Utilities.zeroRange(root, new SourceRange(trivia[0].range.startLine, trivia[0].range.startColumn, trivia[len - 1].range.endLine, trivia[len - 1].range.endColumn));
            // offset the range of the trivia tokens (insert the separator token)
            line = this.range.endLine;
            column = this.range.endColumn;
            for (i = 0; i < len; i++) {
                token = trivia[i];
                if (token.range.startLine === line)
                    token.range.startColumn++;
                if (token.range.endLine === line)
                    token.range.endColumn++;
            }
            // create a new separator
            separator = new Tokenizer.Token(Tokenizer.EToken.COMMA, new SourceRange(line, column, trivia[len - 1].range.endLine, trivia[len - 1].range.endColumn), ',');
            separator.trailingTrivia = trivia;
        }
        else {
            line = this.range.endLine;
            column = this.range.endColumn;
            separator = new Tokenizer.Token(Tokenizer.EToken.COMMA, new SourceRange(line, column, line, column + 2), ',');
            separator.trailingTrivia = [
                new Tokenizer.Token(Tokenizer.EToken.WHITESPACE, new SourceRange(line, column + 1, line, column + 2), ' ')
            ];
        }
        // force recompute
        this._children = null;
        this._tokens = null;
        this._separator = separator;
        this._separator.parent = this;
        Utilities.insertRangeFromNode(root, this._separator);
    };
    Selector.prototype.getText = function () {
        if (this._text === null)
            this._text = toStringNormalize(_super.prototype.getTokens.call(this));
        return this._text;
    };
    Selector.prototype.setText = function (newText) {
        var values = new Parser.Parser(newText).parseComponentValueList();
        if (values)
            this.replaceNodes(values);
        else {
        }
    };
    Selector.prototype.getChildren = function () {
        var children;
        if (this._children === null) {
            children = _super.prototype.getChildren.call(this);
            this._children = children ? children.slice(0) : [];
            if (this._separator)
                this._children.push(this._separator);
        }
        return this._children;
    };
    Selector.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (!this._tokens)
                this._tokens = [];
            if (this._separator)
                this._tokens.push(this._separator);
        }
        return this._tokens;
    };
    Selector.prototype.getLastToken = function () {
        if (this._separator)
            return this._separator;
        return _super.prototype.getLastToken.call(this);
    };
    Selector.prototype.getSeparator = function () {
        return this._separator;
    };
    Selector.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            that.walkChildren(walker, result);
            if (that._separator && (r = that._separator.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    Selector.prototype.toString = function () {
        var s = _super.prototype.toString.call(this);
        if (!this._hasError && this._separator)
            s += this._separator.toString();
        return s;
    };
    return Selector;
})(ComponentValueList);
exports.Selector = Selector;
var SelectorCombinator = (function (_super) {
    __extends(SelectorCombinator, _super);
    function SelectorCombinator() {
        _super.apply(this, arguments);
    }
    SelectorCombinator.prototype.getCombinator = function () {
        var t = this.getToken();
        if (t.token === Tokenizer.EToken.WHITESPACE)
            return ' ';
        return t.src;
    };
    SelectorCombinator.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            return that.getToken().walk(walker);
        });
    };
    return SelectorCombinator;
})(ComponentValue);
exports.SelectorCombinator = SelectorCombinator;
var SimpleSelector = (function (_super) {
    __extends(SimpleSelector, _super);
    function SimpleSelector(value, namespace, pipe) {
        var t;
        _super.call(this);
        this._value = value;
        this._namespace = namespace;
        this._pipe = pipe;
        if (this._value) {
            if (this._value instanceof Tokenizer.Token)
                this._value.parent = this;
            else if (this._value instanceof ASTNode)
                this._value._parent = this;
        }
        if (this._namespace)
            this._namespace.parent = this;
        if (this._pipe)
            this._pipe.parent = this;
        t = this._namespace || this._pipe || this._value;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = this._value || this._pipe || this._namespace;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    }
    SimpleSelector.prototype.getNamespace = function () {
        return this._namespace;
    };
    SimpleSelector.prototype.getPipe = function () {
        return this._pipe;
    };
    SimpleSelector.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._namespace)
                this._children.push(this._namespace);
            if (this._pipe)
                this._children.push(this._pipe);
            if (this._value)
                this._children.push(this._value);
        }
        return this._children;
    };
    SimpleSelector.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._namespace)
                this._tokens.push(this._namespace);
            if (this._pipe)
                this._tokens.push(this._pipe);
            if (this._value)
                this._tokens = this._tokens.concat(this._value.getTokens());
        }
        return this._tokens;
    };
    SimpleSelector.prototype.getFirstToken = function () {
        if (this._namespace)
            return this._namespace;
        if (this._pipe)
            return this._pipe;
        if (this._value instanceof Tokenizer.Token)
            return this._value;
        if (this._value instanceof ASTNode)
            return this._value.getFirstToken();
        return null;
    };
    SimpleSelector.prototype.getLastToken = function () {
        if (this._value instanceof Tokenizer.Token)
            return this._value;
        if (this._value instanceof ASTNode)
            return this._value.getLastToken();
        if (this._pipe)
            return this._pipe;
        if (this._namespace)
            return this._namespace;
        return null;
    };
    SimpleSelector.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._namespace && (r = that._namespace.walk(walker)) !== undefined)
                result.push(r);
            if (that._pipe && (r = that._pipe.walk(walker)) !== undefined)
                result.push(r);
            if (that._value && (r = that._value.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    SimpleSelector.prototype.toString = function () {
        var s = '';
        if (this._hasError)
            return this.errorTokensToString();
        if (this._namespace)
            s += this._namespace.toString();
        if (this._pipe)
            s += this._pipe.toString();
        if (this._value)
            s += this._value.toString();
        return s;
    };
    SimpleSelector.prototype.getValue = function () {
        var s = '';
        if (this._namespace)
            s += this._namespace.src;
        if (this._pipe)
            s += this._pipe.src;
        if (this._value instanceof BlockComponentValue)
            s += this._value.getValue();
        else if (this._value instanceof ComponentValue)
            s += this._value.getValue();
        else if (this._value instanceof Tokenizer.Token)
            s += this._value.value || this._value.toString();
        else
            s += this._value.toString();
        return s;
    };
    return SimpleSelector;
})(ASTNode);
exports.SimpleSelector = SimpleSelector;
var TypeSelector = (function (_super) {
    __extends(TypeSelector, _super);
    function TypeSelector() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[0]), isASTConstructor ?
            args[1] :
            (args[1] ? new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[1]) : undefined), isASTConstructor ?
            args[2] :
            (args[1] !== '' ? new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '|') : undefined));
    }
    TypeSelector.prototype.getType = function () {
        return this._value;
    };
    return TypeSelector;
})(SimpleSelector);
exports.TypeSelector = TypeSelector;
var UniversalSelector = (function (_super) {
    __extends(UniversalSelector, _super);
    function UniversalSelector() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '*'), isASTConstructor ?
            args[1] :
            (args[0] ? new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[0]) : undefined), isASTConstructor ?
            args[2] :
            (args[0] !== '' ? new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '|') : undefined));
    }
    UniversalSelector.prototype.getType = function () {
        return this._value;
    };
    return UniversalSelector;
})(SimpleSelector);
exports.UniversalSelector = UniversalSelector;
var AttributeSelector = (function (_super) {
    __extends(AttributeSelector, _super);
    function AttributeSelector() {
        _super.apply(this, arguments);
    }
    AttributeSelector.prototype.getAttribute = function () {
        return this._value;
    };
    return AttributeSelector;
})(SimpleSelector);
exports.AttributeSelector = AttributeSelector;
var ClassSelector = (function (_super) {
    __extends(ClassSelector, _super);
    function ClassSelector() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token, className = isASTConstructor ?
            args[1] :
            new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[0]);
        _super.call(this, isASTConstructor ?
            args[0] :
            new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '.'), isASTConstructor ?
            args[2] :
            (args[1] ? new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[1]) : undefined), isASTConstructor ?
            args[3] :
            (args[1] !== '' ? new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '|') : undefined));
        this._className = className;
        this._className.parent = this;
        this.range.endLine = className.range.endLine;
        this.range.endColumn = className.range.endColumn;
    }
    ClassSelector.prototype.getClassName = function () {
        return this._className;
    };
    ClassSelector.prototype.getDot = function () {
        return this._value;
    };
    ClassSelector.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = _super.prototype.getChildren.call(this);
            this._children.push(this._className);
        }
        return this._children;
    };
    ClassSelector.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (!this._tokens)
                this._tokens = [];
            this._tokens.push(this._className);
        }
        return this._tokens;
    };
    ClassSelector.prototype.getLastToken = function () {
        return this._className;
    };
    ClassSelector.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._namespace && (r = that._namespace.walk(walker)) !== undefined)
                result.push(r);
            if (that._pipe && (r = that._pipe.walk(walker)) !== undefined)
                result.push(r);
            if (that._value && (r = that._value.walk(walker)) !== undefined)
                result.push(r);
            if (that._className && (r = that._className.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    ClassSelector.prototype.toString = function () {
        var s = _super.prototype.toString.call(this);
        if (!this._hasError)
            s += this._className.toString();
        return s;
    };
    return ClassSelector;
})(SimpleSelector);
exports.ClassSelector = ClassSelector;
var IDSelector = (function (_super) {
    __extends(IDSelector, _super);
    function IDSelector() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            new Tokenizer.Token(Tokenizer.EToken.HASH, new SourceRange(), '#' + args[0]), isASTConstructor ?
            args[1] :
            (args[1] ? new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[1]) : undefined), isASTConstructor ?
            args[2] :
            (args[1] !== '' ? new Tokenizer.Token(Tokenizer.EToken.DELIM, new SourceRange(), '|') : undefined));
    }
    IDSelector.prototype.getID = function () {
        return this._value;
    };
    return IDSelector;
})(SimpleSelector);
exports.IDSelector = IDSelector;
var PseudoClass = (function (_super) {
    __extends(PseudoClass, _super);
    function PseudoClass() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pseudoClass;
        _super.call(this);
        if (args[0] instanceof Tokenizer.Token)
            this.set(args[0], args[1], args[2]);
        else if (typeof args[0] === 'string') {
            pseudoClass = args[0];
            this.set(new Tokenizer.Token(Tokenizer.EToken.COLON, new SourceRange(), ':'), pseudoClass[1] === ':' ? new Tokenizer.Token(Tokenizer.EToken.COLON, new SourceRange(), ':') : null, new ComponentValue(new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), pseudoClass.replace(/^:+/g, ''))));
        }
    }
    PseudoClass.prototype.getPseudoClassName = function () {
        return this._pseudoClassName;
    };
    PseudoClass.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._colon1)
                this._children.push(this._colon1);
            if (this._colon2)
                this._children.push(this._colon2);
            if (this._pseudoClassName)
                this._children.push(this._pseudoClassName);
        }
        return this._children;
    };
    PseudoClass.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._colon1)
                this._tokens.push(this._colon1);
            if (this._colon2)
                this._tokens.push(this._colon2);
            if (this._pseudoClassName)
                this._tokens = this._tokens.concat(this._pseudoClassName.getTokens());
        }
        return this._tokens;
    };
    PseudoClass.prototype.getFirstToken = function () {
        if (this._colon1)
            return this._colon1;
        if (this._colon2)
            return this._colon2;
        if (this._pseudoClassName instanceof Tokenizer.Token)
            return this._pseudoClassName;
        if (this._pseudoClassName instanceof ASTNode)
            return this._pseudoClassName.getFirstToken();
        return null;
    };
    PseudoClass.prototype.getLastToken = function () {
        if (this._pseudoClassName instanceof Tokenizer.Token)
            return this._pseudoClassName;
        if (this._pseudoClassName instanceof ASTNode)
            return this._pseudoClassName.getLastToken();
        if (this._colon2)
            return this._colon2;
        if (this._colon1)
            return this._colon1;
        return null;
    };
    PseudoClass.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._colon1 && (r = that._colon1.walk(walker)) !== undefined)
                result.push(r);
            if (that._colon2 && (r = that._colon2.walk(walker)) !== undefined)
                result.push(r);
            if (that._pseudoClassName && (r = that._pseudoClassName.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    PseudoClass.prototype.toString = function () {
        var s = '';
        if (this._hasError)
            return this.errorTokensToString();
        if (this._colon1)
            s += this._colon1.toString();
        if (this._colon2)
            s += this._colon2.toString();
        if (this._pseudoClassName)
            s += this._pseudoClassName.toString();
        return s;
    };
    PseudoClass.prototype.getValue = function () {
        var s = '';
        if (this._colon1)
            s += this._colon1.src;
        if (this._colon2)
            s += this._colon2.src;
        if (this._pseudoClassName)
            s += this._pseudoClassName.getValue();
        return s;
    };
    PseudoClass.prototype.set = function (colon1, colon2, value) {
        var t;
        this._colon1 = colon1;
        this._colon2 = colon2;
        this._pseudoClassName = value;
        if (this._colon1)
            this._colon1.parent = this;
        if (this._colon2)
            this._colon2.parent = this;
        if (this._pseudoClassName)
            this._pseudoClassName._parent = this;
        t = colon1 || colon2 || value;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = value || colon2 || colon1;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    };
    return PseudoClass;
})(ASTNode);
exports.PseudoClass = PseudoClass;
var DeclarationList = (function (_super) {
    __extends(DeclarationList, _super);
    function DeclarationList(declarations, lbrace, rbrace) {
        _super.call(this, declarations);
        // TODO: adjust source range
        this._lbrace = lbrace !== undefined ? lbrace : new Tokenizer.Token(Tokenizer.EToken.LBRACE, new SourceRange(), '{');
        this._rbrace = rbrace !== undefined ? rbrace : new Tokenizer.Token(Tokenizer.EToken.RBRACE, new SourceRange(), '}');
        if (this._lbrace)
            this._lbrace.parent = this;
        if (this._rbrace)
            this._rbrace.parent = this;
        if (lbrace) {
            this.range.startLine = lbrace.range.startLine;
            this.range.startColumn = lbrace.range.startColumn;
        }
        if (rbrace) {
            this.range.endLine = rbrace.range.endLine;
            this.range.endColumn = rbrace.range.endColumn;
        }
    }
    DeclarationList.fromErrorTokens = function (tokens) {
        var declarationList = new DeclarationList([]);
        declarationList._tokens = tokens;
        declarationList._children = tokens;
        declarationList._hasError = true;
        setRangeFromChildren(declarationList.range, tokens);
        return declarationList;
    };
    DeclarationList.prototype.insertDeclaration = function (declaration, pos) {
        this.insertNode(declaration, pos);
    };
    DeclarationList.prototype.deleteDeclaration = function (pos) {
        this.deleteNode(pos);
    };
    DeclarationList.prototype.deleteAllDeclarations = function () {
        this.deleteAllNodes();
    };
    DeclarationList.prototype.getChildren = function () {
        var children;
        if (this._children === null) {
            children = _super.prototype.getChildren.call(this);
            this._children = children ? children.slice(0) : [];
            if (this._lbrace)
                this._children.unshift(this._lbrace);
            if (this._rbrace)
                this._children.push(this._rbrace);
        }
        return this._children;
    };
    DeclarationList.prototype.getTokens = function () {
        if (this._tokens === null) {
            _super.prototype.getTokens.call(this);
            if (!this._tokens)
                this._tokens = [];
            if (this._lbrace)
                this._tokens.unshift(this._lbrace);
            if (this._rbrace)
                this._tokens.push(this._rbrace);
        }
        return this._tokens;
    };
    DeclarationList.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        if (this._lbrace)
            return this._lbrace;
        return _super.prototype.getFirstToken.call(this);
    };
    DeclarationList.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (this._rbrace)
            return this._rbrace;
        return _super.prototype.getLastToken.call(this);
    };
    DeclarationList.prototype.getLBrace = function () {
        return this._lbrace;
    };
    DeclarationList.prototype.getRBrace = function () {
        return this._rbrace;
    };
    DeclarationList.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._lbrace && (r = that._lbrace.walk(walker)) !== undefined)
                result.push(r);
            that.walkChildren(walker, result);
            if (that._rbrace && (r = that._rbrace.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    DeclarationList.prototype.toString = function (excludeBraces) {
        var s = _super.prototype.toString.call(this);
        if (!this._hasError && !excludeBraces) {
            if (this._lbrace)
                s = this._lbrace.toString() + s;
            if (this._rbrace)
                s += this._rbrace.toString();
        }
        return s;
    };
    return DeclarationList;
})(ASTNodeList);
exports.DeclarationList = DeclarationList;
var Declaration = (function (_super) {
    __extends(Declaration, _super);
    function Declaration() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        _super.call(this);
        this._text = null;
        this._nameText = null;
        if (((args[0] instanceof ComponentValueList) || args[0] === null) &&
            ((args[1] instanceof Tokenizer.Token) || args[1] === null) &&
            ((args[2] instanceof DeclarationValue) || args[2] === null)) {
            this.set(args[0], // name
            args[1], // colon
            args[2], // value
            args[3], // semicolon
            args[4], // lcomment
            args[5] // rcomment
            );
        }
        else if ((typeof args[0] === 'string') && (typeof args[1] === 'string')) {
            var value = args[1], important = args[2], disabled = args[3];
            if (important && value && value.toLowerCase().indexOf('!important') < 0)
                value += ' !important';
            this.set(new ComponentValueList(new Parser.Parser(args[0]).parseComponentValueList()), new Tokenizer.Token(Tokenizer.EToken.COLON, new SourceRange(), ':'), new Parser.Parser(args[1]).parseDeclarationValue(), new Tokenizer.Token(Tokenizer.EToken.SEMICOLON, new SourceRange(), ';'), disabled ? new Tokenizer.Token(Tokenizer.EToken.LCOMMENT, new SourceRange(), '/*') : undefined, disabled ? new Tokenizer.Token(Tokenizer.EToken.RCOMMENT, new SourceRange(), '*/') : undefined);
        }
        else
            throw new Error('Unsupported constructor arguments');
    }
    Declaration.fromErrorTokens = function (tokens, name, colon) {
        var decl = new Declaration(name || null, colon || null, null, null);
        if (colon)
            tokens.unshift(colon);
        if (name)
            Array.prototype.unshift.apply(tokens, name.getTokens());
        decl._tokens = tokens;
        decl._children = tokens;
        decl._hasError = true;
        setRangeFromChildren(decl.range, tokens);
        return decl;
    };
    Declaration.prototype.setName = function (newName) {
        var newNameLc = newName ? newName.toLowerCase() : newName, nameValues, oldRange, root;
        if (this.getNameAsString().toLowerCase() === newNameLc)
            return;
        // parse the new name
        nameValues = new Parser.Parser(newName).parseComponentValueList();
        if (!nameValues || nameValues.length === 0)
            return;
        // set the name property
        root = this.getRoot();
        oldRange = this._name.range;
        Utilities.zeroRange(root, this._name);
        this._name = new ComponentValueList(nameValues);
        this._name._parent = this;
        // adjust the ranges
        try {
            Utilities.offsetRange(this._name, oldRange.startLine, oldRange.startColumn);
            Utilities.insertRangeFromNode(root, this._name);
        }
        catch (e) {
        }
        // recompute
        this._text = null;
        this._nameText = null;
        this._tokens = null;
        this._children = null;
    };
    Declaration.prototype.getName = function () {
        return this._name;
    };
    Declaration.prototype.getNameAsString = function () {
        if (this._nameText === null)
            this._nameText = this._name ? toStringNormalize(this._name.getTokens()) : '';
        return this._nameText;
    };
    Declaration.prototype.getColon = function () {
        return this._colon;
    };
    Declaration.prototype.getValue = function () {
        return this._value;
    };
    Declaration.prototype.getValueAsString = function (excludeImportant) {
        return this._value ? this._value.getText(excludeImportant) : '';
    };
    Declaration.prototype.setValue = function (newValue) {
        var newValueLc = newValue ? newValue.toLowerCase() : newValue, oldRange, root;
        if (this.getValueAsString().toLowerCase() === newValueLc)
            return;
        // TODO: handle case when there are errors (name, value not defined)
        root = this.getRoot();
        oldRange = this._value.range;
        Utilities.zeroRange(root, this._value);
        this._value = new Parser.Parser(newValue).parseDeclarationValue();
        this._value._parent = this;
        // adjust the ranges
        Utilities.offsetRange(this._value, oldRange.startLine, oldRange.startColumn);
        Utilities.insertRangeFromNode(root, this._value);
        // recompute
        this._text = null;
        this._nameText = null;
        this._tokens = null;
        this._children = null;
    };
    Declaration.prototype.getSemicolon = function () {
        return this._semicolon;
    };
    Declaration.prototype.getLComment = function () {
        return this._lcomment;
    };
    Declaration.prototype.getRComment = function () {
        return this._rcomment;
    };
    Declaration.prototype.getDisabled = function () {
        return this._lcomment !== undefined && this._rcomment !== undefined;
    };
    Declaration.prototype.setDisabled = function (isDisabled) {
        var root;
        if (this.getDisabled() === isDisabled)
            return;
        root = this.getRoot();
        if (isDisabled) {
            // insert an "opening comment" token
            this._lcomment = new Tokenizer.Token(Tokenizer.EToken.LCOMMENT, new SourceRange(this.range.startLine, this.range.startColumn, this.range.startLine, this.range.startColumn + 2), '/*');
            this._lcomment.parent = this;
            Utilities.insertRangeFromNode(root, this._lcomment);
            // insert a "closing comment" token
            this._rcomment = new Tokenizer.Token(Tokenizer.EToken.RCOMMENT, new SourceRange(this.range.endLine, this.range.endColumn, this.range.endLine, this.range.endColumn + 2), '*/');
            this._rcomment.parent = this;
            Utilities.insertRangeFromNode(root, this._rcomment);
        }
        else {
            Utilities.zeroRange(root, this._lcomment);
            this._lcomment = null;
            Utilities.zeroRange(root, this._rcomment);
            this._rcomment = null;
        }
        // re-create children and token arrays
        this._children = null;
        this._tokens = null;
    };
    Declaration.prototype.getImportant = function () {
        return this._value ? this._value.getImportant() : false;
    };
    Declaration.prototype.getText = function () {
        if (this._text === null)
            this._text = toStringNormalize(this.getTokens());
        return this._text;
    };
    Declaration.prototype.setText = function (newText) {
        var declaration = Parser.parseDeclaration(newText), root = this.getRoot();
        if (declaration) {
            Utilities.offsetRange(declaration, this.range.startLine, this.range.startColumn);
            Utilities.zeroRange(root, this);
            this.set(declaration._name, declaration._colon, declaration._value, declaration._semicolon, declaration._lcomment, declaration._rcomment);
            Utilities.insertRangeFromNode(root, this);
            // recompute
            this._text = null;
            this._nameText = null;
            this._tokens = null;
            this._children = null;
        }
        else {
        }
    };
    Declaration.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._lcomment)
                this._children.push(this._lcomment);
            if (this._name)
                this._children.push(this._name);
            if (this._colon)
                this._children.push(this._colon);
            if (this._value)
                this._children.push(this._value);
            if (this._semicolon)
                this._children.push(this._semicolon);
            if (this._rcomment)
                this._children.push(this._rcomment);
        }
        return this._children;
    };
    Declaration.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [];
            if (this._lcomment)
                this._tokens.push(this._lcomment);
            if (this._name)
                this._tokens = this._tokens.concat(this._name.getTokens());
            if (this._colon)
                this._tokens.push(this._colon);
            if (this._value)
                this._tokens = this._tokens.concat(this._value.getTokens());
            if (this._semicolon)
                this._tokens.push(this._semicolon);
            if (this._rcomment)
                this._tokens.push(this._rcomment);
        }
        return this._tokens;
    };
    Declaration.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        if (this._lcomment)
            return this._lcomment;
        if (this._name instanceof Tokenizer.Token)
            return this._name;
        if (this._name instanceof ASTNode)
            return this._name.getFirstToken();
        if (this._colon)
            return this._colon;
        if (this._value instanceof Tokenizer.Token)
            return this._value;
        if (this._value instanceof ASTNode)
            return this._value.getFirstToken();
        if (this._semicolon)
            return this._semicolon;
        if (this._rcomment)
            return this._rcomment;
        return null;
    };
    Declaration.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (this._rcomment)
            return this._rcomment;
        if (this._semicolon)
            return this._semicolon;
        if (this._value instanceof Tokenizer.Token)
            return this._value;
        if (this._value instanceof ASTNode)
            return this._value.getFirstToken();
        if (this._colon)
            return this._colon;
        if (this._name instanceof Tokenizer.Token)
            return this._name;
        if (this._name instanceof ASTNode)
            return this._name.getFirstToken();
        if (this._lcomment)
            return this._lcomment;
        return null;
    };
    Declaration.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._lcomment && (r = that._lcomment.walk(walker)) !== undefined)
                result.push(r);
            if (that._name && (r = that._name.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._colon && (r = that._colon.walk(walker)) !== undefined)
                result.push(r);
            if (that._value && (r = that._value.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._semicolon && (r = that._semicolon.walk(walker)) !== undefined)
                result.push(r);
            if (that._rcomment && (r = that._rcomment.walk(walker)) !== undefined)
                result.push(r);
            return result;
        });
    };
    Declaration.prototype.toString = function () {
        var s = '';
        if (this._hasError)
            return this.errorTokensToString();
        if (this._lcomment)
            s += this._lcomment.toString();
        if (this._name)
            s += this._name.toString();
        if (this._colon)
            s += this._colon.toString();
        if (this._value)
            s += this._value.toString();
        if (this._semicolon)
            s += this._semicolon.toString();
        if (this._rcomment)
            s += this._rcomment.toString();
        return s;
    };
    Declaration.prototype.set = function (name, colon, value, semicolon, lcomment, rcomment) {
        var t;
        this._name = name;
        this._colon = colon;
        this._value = value;
        this._semicolon = semicolon;
        this._lcomment = lcomment;
        this._rcomment = rcomment;
        // set parents
        if (name)
            this._name._parent = this;
        if (colon)
            this._colon.parent = this;
        if (value)
            this._value._parent = this;
        if (semicolon)
            this._semicolon.parent = this;
        if (lcomment)
            this._lcomment.parent = this;
        if (rcomment)
            this._rcomment.parent = this;
        // set range
        t = lcomment || name || colon || value || semicolon || rcomment;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = rcomment || semicolon || value || colon || name || lcomment;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    };
    return Declaration;
})(ASTNode);
exports.Declaration = Declaration;
var DeclarationValue = (function (_super) {
    __extends(DeclarationValue, _super);
    function DeclarationValue(values) {
        _super.call(this, values);
        this._text = null;
        this._textWithoutImportant = null;
    }
    DeclarationValue.prototype.getText = function (excludeImportant) {
        var tokens, len, i, node;
        if (excludeImportant) {
            if (this._textWithoutImportant === null) {
                tokens = [];
                len = this._nodes.length;
                for (i = 0; i < len; i++) {
                    node = this._nodes[i];
                    if (!(node instanceof ImportantComponentValue))
                        tokens = tokens.concat(node.getTokens());
                }
                this._textWithoutImportant = toStringNormalize(tokens);
            }
            return this._textWithoutImportant;
        }
        if (this._text === null)
            this._text = toStringNormalize(this.getTokens());
        return this._text;
    };
    DeclarationValue.prototype.setText = function (value) {
        var declarationValue, nodes;
        if (this._text === value)
            return;
        this._text = null;
        declarationValue = new Parser.Parser(value).parseDeclarationValue();
        if (declarationValue) {
            Utilities.offsetRange(declarationValue, this.range.startLine, this.range.startColumn);
            Utilities.updateNodeRange(this.getRoot(), this, declarationValue.range);
            nodes = this._nodes;
            nodes.splice.apply(nodes, [0, nodes.length].concat(declarationValue._children));
        }
        else {
        }
    };
    DeclarationValue.prototype.getImportant = function () {
        var nodes = this._nodes;
        return nodes[nodes.length - 1] instanceof ImportantComponentValue;
    };
    DeclarationValue.prototype.toString = function (excludeImportant) {
        var s = '', nodes, len, i, value;
        if (this._hasError)
            return this.errorTokensToString();
        nodes = this._nodes;
        if (nodes) {
            len = nodes.length;
            for (i = 0; i < len; i++) {
                value = nodes[i];
                if (!(excludeImportant && (value instanceof ImportantComponentValue)))
                    s += value.toString();
            }
        }
        return s;
    };
    return DeclarationValue;
})(ComponentValueList);
exports.DeclarationValue = DeclarationValue;
var AtRule = (function (_super) {
    __extends(AtRule, _super);
    function AtRule(atKeyword, prelude, blockOrSemicolon) {
        var t;
        _super.call(this);
        this._atKeyword = atKeyword;
        this._prelude = prelude;
        this._block = blockOrSemicolon instanceof ASTNode ? blockOrSemicolon : null;
        this._semicolon = blockOrSemicolon instanceof Tokenizer.Token ? blockOrSemicolon : null;
        // set parents
        if (this._atKeyword)
            this._atKeyword.parent = this;
        if (this._prelude)
            this._prelude._parent = this;
        if (this._block)
            this._block._parent = this;
        if (this._semicolon)
            this._semicolon.parent = this;
        // set range
        t = atKeyword || prelude || blockOrSemicolon;
        if (t) {
            this.range.startLine = t.range.startLine;
            this.range.startColumn = t.range.startColumn;
        }
        t = blockOrSemicolon || prelude || atKeyword;
        if (t) {
            this.range.endLine = t.range.endLine;
            this.range.endColumn = t.range.endColumn;
        }
    }
    AtRule.prototype.getAtKeyword = function () {
        return this._atKeyword;
    };
    AtRule.prototype.getPrelude = function () {
        return this._prelude;
    };
    AtRule.prototype.getDeclarations = function () {
        return this._block instanceof DeclarationList ? this._block : undefined;
    };
    AtRule.prototype.getRules = function () {
        return this._block instanceof RuleList ? this._block : undefined;
    };
    AtRule.prototype.getSemicolon = function () {
        return this._semicolon;
    };
    AtRule.prototype.getChildren = function () {
        if (this._children === null) {
            this._children = [];
            if (this._atKeyword)
                this._children.push(this._atKeyword);
            if (this._prelude)
                this._children.push(this._prelude);
            if (this._block)
                this._children.push(this._block);
            if (this._semicolon)
                this._children.push(this._semicolon);
        }
        return this._children;
    };
    AtRule.prototype.getTokens = function () {
        if (this._tokens === null) {
            this._tokens = [this._atKeyword];
            if (this._prelude)
                this._tokens = this._tokens.concat(this._prelude.getTokens());
            if (this._block)
                this._tokens = this._tokens.concat(this._block.getTokens());
            if (this._semicolon)
                this._tokens.push(this._semicolon);
        }
        return this._tokens;
    };
    AtRule.prototype.getFirstToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[0];
        return this._atKeyword;
    };
    AtRule.prototype.getLastToken = function () {
        if (this._hasError && this._tokens && this._tokens.length > 0)
            return this._tokens[this._tokens.length - 1];
        if (this._semicolon)
            return this._semicolon;
        if (this._block)
            return this._block.getLastToken();
        if (this._prelude)
            return this._prelude.getLastToken();
        return this._atKeyword;
    };
    AtRule.prototype.walk = function (walker) {
        var that = this;
        return this._walk(walker, function () {
            var result = [], r;
            if (that._atKeyword && (r = that._atKeyword.walk(walker)) !== undefined)
                result.push(r);
            if (that._prelude && (r = that._prelude.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._block && (r = that._block.walk(walker)) !== undefined)
                result = result.concat(r);
            if (that._semicolon && (r = that._semicolon.walk(walker)) !== undefined)
                result = result.concat(r);
            return result;
        });
    };
    AtRule.prototype.toString = function () {
        var s;
        if (this._hasError)
            return this.errorTokensToString();
        s = this._atKeyword.toString();
        if (this._prelude)
            s += this._prelude.toString();
        if (this._block)
            s += this._block.toString();
        if (this._semicolon)
            s += this._semicolon.toString();
        return s;
    };
    return AtRule;
})(AbstractRule);
exports.AtRule = AtRule;
var AtCharset = (function (_super) {
    __extends(AtCharset, _super);
    function AtCharset() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@charset')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser(args[0]).parseComponentValueList()), isASTConstructor ?
            args[2] :
            new Tokenizer.Token(Tokenizer.EToken.SEMICOLON, new SourceRange(), ';'));
        this._charset = null;
    }
    AtCharset.prototype.getCharset = function () {
        var prelude = this.getPrelude(), first;
        if (this._charset === null && prelude) {
            first = prelude[0];
            this._charset = first ? first.getValue() : '';
        }
        return this._charset;
    };
    return AtCharset;
})(AtRule);
exports.AtCharset = AtCharset;
var AtCustomMedia = (function (_super) {
    __extends(AtCustomMedia, _super);
    function AtCustomMedia() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@custom-media')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser(args[0] + ' ' + args[1]).parseComponentValueList()), isASTConstructor ?
            args[2] :
            new Tokenizer.Token(Tokenizer.EToken.SEMICOLON, new SourceRange(), ';'));
        this._extensionName = null;
        this._media = null;
    }
    AtCustomMedia.prototype.getExtensionName = function () {
        if (this._extensionName === null)
            this.getExtensionNameAndMedia();
        return this._extensionName;
    };
    AtCustomMedia.prototype.getMedia = function () {
        if (this._media === null)
            this.getExtensionNameAndMedia();
        return this._media;
    };
    AtCustomMedia.prototype.getExtensionNameAndMedia = function () {
        var prelude = this.getPrelude(), children, len, i, l, node, tokens = [], nodeTokens;
        children = prelude && prelude.getChildren();
        if (children) {
            len = children.length;
            for (i = 0; i < len; i++) {
                node = children[i];
                nodeTokens = node.getTokens();
                tokens = tokens.concat(nodeTokens);
                if (nodeTokens) {
                    l = nodeTokens.length;
                    if (l > 0 && (nodeTokens[l - 1].token === Tokenizer.EToken.WHITESPACE || nodeTokens[l - 1].hasTrailingWhitespace())) {
                        this._extensionName = toStringNormalize(tokens);
                        this._media = new ComponentValueList(children.slice(i + 1));
                        break;
                    }
                }
            }
        }
    };
    return AtCustomMedia;
})(AtRule);
exports.AtCustomMedia = AtCustomMedia;
var AtDocument = (function (_super) {
    __extends(AtDocument, _super);
    function AtDocument() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@document')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser(args[0]).parseComponentValueList()), isASTConstructor ? args[2] : args[1]);
        var getArg = function (fnx) {
            var args = fnx.getArgs(), arg = args.length > 0 ? args[0] : null;
            if (!arg)
                return '';
            return arg.getLength() === 1 ? arg[0].getValue() : arg.getValue();
        };
        var prelude = this.getPrelude(), len = (prelude && prelude.getLength()) || 0, i, val, name;
        for (i = 0; i < len; i++) {
            val = prelude[i];
            if (val instanceof ComponentValue && val.getToken().token === Tokenizer.EToken.URL)
                this._url = val.getValue();
            else if (val instanceof FunctionComponentValue) {
                name = val.getName().value.toLowerCase();
                if (name === 'url-prefix')
                    this._urlPrefix = getArg(val);
                else if (name === 'domain')
                    this._domain = getArg(val);
                else if (name === 'regexp')
                    this._regexp = getArg(val);
            }
        }
    }
    AtDocument.prototype.getUrl = function () {
        return this._url;
    };
    AtDocument.prototype.getUrlPrefix = function () {
        return this._urlPrefix;
    };
    AtDocument.prototype.getDomain = function () {
        return this._domain;
    };
    AtDocument.prototype.getRegexp = function () {
        return this._regexp;
    };
    return AtDocument;
})(AtRule);
exports.AtDocument = AtDocument;
var AtFontFace = (function (_super) {
    __extends(AtFontFace, _super);
    function AtFontFace() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@font-face')), isASTConstructor ? args[1] : new ComponentValueList([]), isASTConstructor ? args[2] : args[0]);
    }
    return AtFontFace;
})(AtRule);
exports.AtFontFace = AtFontFace;
var AtHost = (function (_super) {
    __extends(AtHost, _super);
    function AtHost() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@host')), isASTConstructor ? args[1] : new ComponentValueList([]), isASTConstructor ? args[2] : args[0]);
    }
    return AtHost;
})(AtRule);
exports.AtHost = AtHost;
var AtImport = (function (_super) {
    __extends(AtImport, _super);
    function AtImport() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@import')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser('url("' + args[0] + '")' + (args[1] === undefined ? '' : (' ' + args[1]))).parseComponentValueList()), isASTConstructor ?
            args[2] :
            new Tokenizer.Token(Tokenizer.EToken.SEMICOLON, new SourceRange(), ';'));
        this._url = null;
        this._media = null;
    }
    AtImport.prototype.getUrl = function () {
        var prelude = this.getPrelude(), first;
        if (this._url === null && prelude) {
            first = prelude[0];
            this._url = first ? first.getValue() : '';
        }
        return this._url;
    };
    AtImport.prototype.getMedia = function () {
        var prelude = this.getPrelude(), children;
        if (this._media === null && prelude) {
            children = prelude.getChildren();
            if (children) {
                this._media = new ComponentValueList(children.slice(1));
                this._media._parent = this;
            }
        }
        return this._media;
    };
    return AtImport;
})(AtRule);
exports.AtImport = AtImport;
var AtKeyframes = (function (_super) {
    __extends(AtKeyframes, _super);
    function AtKeyframes() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@keyframes')), isASTConstructor ?
            args[1] :
            new ComponentValueList([new ComponentValue(new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[0]))]), isASTConstructor ? args[2] : args[1]);
        this._animationName = null;
    }
    AtKeyframes.prototype.getAnimationName = function () {
        var prelude = this.getPrelude(), first;
        if (this._animationName === null && prelude) {
            first = prelude[0];
            this._animationName = first ? first.getValue() : '';
        }
        return this._animationName;
    };
    return AtKeyframes;
})(AtRule);
exports.AtKeyframes = AtKeyframes;
var AtMedia = (function (_super) {
    __extends(AtMedia, _super);
    function AtMedia() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@media')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser(args[0]).parseComponentValueList()), isASTConstructor ? args[2] : args[1]);
        this._media = null;
    }
    AtMedia.prototype.getMedia = function () {
        if (this._media === null)
            this._media = this.getPrelude() || new ComponentValueList([]);
        return this._media;
    };
    return AtMedia;
})(AtRule);
exports.AtMedia = AtMedia;
var AtNamespace = (function (_super) {
    __extends(AtNamespace, _super);
    function AtNamespace() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@namespace')), isASTConstructor ?
            args[1] :
            new ComponentValueList([
                new ComponentValue(trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[1] || ''))),
                new ComponentValue(new Tokenizer.Token(Tokenizer.EToken.URL, new SourceRange(), '@url("' + args[0] + '")', args[0]))
            ]), isASTConstructor ?
            args[2] :
            new Tokenizer.Token(Tokenizer.EToken.SEMICOLON, new SourceRange(), ';'));
        this._url = null;
        this._prefix = null;
    }
    AtNamespace.prototype.getUrl = function () {
        if (this._url === null)
            this.getPrefixAndUrl();
        return this._url;
    };
    AtNamespace.prototype.getPrefix = function () {
        if (this._prefix === null)
            this.getPrefixAndUrl();
        return this._prefix;
    };
    AtNamespace.prototype.getPrefixAndUrl = function () {
        var prelude = this.getPrelude(), len, i, first, children, child, isUrl = true, t, token, tokens;
        if (prelude) {
            len = prelude.getLength();
            first = prelude[0];
            if (len === 1) {
                this._prefix = '';
                this._url = first.getValue();
            }
            else if (len > 1) {
                // set the prefix
                this._prefix = first.getValue();
                // find the URL
                // check if the rest of the prelude is a single URL
                children = prelude.getChildren();
                len = children.length;
                for (i = 1; i < len; i++) {
                    child = children[i];
                    // not a single URL if a child isn't a ComponentValue
                    if (!(child instanceof ComponentValue) || this._url !== null) {
                        isUrl = false;
                        break;
                    }
                    // check that tokens of the ComponentValue are either URLs or whitespaces
                    t = child.getToken();
                    token = t.token;
                    if (token !== Tokenizer.EToken.URL && token !== Tokenizer.EToken.WHITESPACE) {
                        isUrl = false;
                        break;
                    }
                    // set the URL if an URL token was encountered
                    if (token === Tokenizer.EToken.URL)
                        this._url = child.getValue();
                }
                // concat the rest of the prelude if it wasn't a single URL
                if (!isUrl) {
                    tokens = [];
                    for (i = 1; i < len; i++)
                        tokens = tokens.concat(children[i].getTokens());
                    this._url = toStringNormalize(tokens);
                }
            }
        }
    };
    return AtNamespace;
})(AtRule);
exports.AtNamespace = AtNamespace;
var AtPage = (function (_super) {
    __extends(AtPage, _super);
    function AtPage() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@page')), isASTConstructor ?
            args[1] :
            new ComponentValueList([
                new ComponentValue(new Tokenizer.Token(Tokenizer.EToken.IDENT, new SourceRange(), args[0]))
            ]), isASTConstructor ? args[2] : args[1]);
        this._pseudoClass = null;
    }
    AtPage.prototype.getPseudoClass = function () {
        if (this._pseudoClass === null)
            this._pseudoClass = this.getPrelude() || new ComponentValueList([]);
        return this._pseudoClass;
    };
    return AtPage;
})(AtRule);
exports.AtPage = AtPage;
var AtSupports = (function (_super) {
    __extends(AtSupports, _super);
    function AtSupports() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var isASTConstructor = args[0] instanceof Tokenizer.Token;
        _super.call(this, isASTConstructor ?
            args[0] :
            trailingWhitespace(new Tokenizer.Token(Tokenizer.EToken.AT_KEYWORD, new SourceRange(), '@supports')), isASTConstructor ?
            args[1] :
            new ComponentValueList(new Parser.Parser(args[0]).parseComponentValueList()), isASTConstructor ? args[2] : args[1]);
    }
    AtSupports.prototype.getSupports = function () {
        if (this._supports === null)
            this._supports = this.getPrelude() || new ComponentValueList([]);
        return this._supports;
    };
    return AtSupports;
})(AtRule);
exports.AtSupports = AtSupports;
