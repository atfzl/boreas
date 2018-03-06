var AST = require('./ast');
var RangeAdapter = require('./inspector-rangeadapter');
function toJSON(node) {
    return node.walk(function (ast, descend, walker) {
        var range;
        if (ast instanceof AST.Rule) {
            return {
                selectorList: ast.getSelectors().walk(walker),
                style: ast.getDeclarations().walk(walker)
            };
        }
        if (ast instanceof AST.SelectorList) {
            return {
                selectors: descend(),
                text: RangeAdapter.getText(ast, RangeAdapter.getRange(ast))
            };
        }
        if (ast instanceof AST.Selector) {
            return {
                text: ast.getText(),
                range: RangeAdapter.getRange(ast)
            };
        }
        if (ast instanceof AST.DeclarationList) {
            range = RangeAdapter.getRange(ast);
            return {
                cssProperties: descend(),
                cssText: RangeAdapter.getText(ast, range),
                range: range
            };
        }
        if (ast instanceof AST.Declaration) {
            range = RangeAdapter.getRange(ast);
            var name = ast.getName();
            var value = ast.getValue();
            return {
                name: (name && name.toString().trim()) || '',
                value: (value && value.getText()) || '',
                important: (value && value.getImportant()) || false,
                disabled: ast.getDisabled(),
                text: RangeAdapter.getText(ast, range),
                range: range
            };
        }
        if (ast instanceof AST.AtRule) {
            // only descend if the @rule has child rules
            if (ast.getRules())
                return ast.getRules().walk(walker);
            return null;
        }
        if (ast instanceof AST.RuleList) {
            var result = [], ret = descend(), len = ret.length;
            // flatten the result and remove "null" occurrences
            for (var i = 0; i < len; i++) {
                var r = ret[i];
                if (r === null)
                    continue;
                if (Array.isArray(r))
                    result = result.concat(r);
                else
                    result.push(r);
            }
            return result;
        }
    });
}
exports.toJSON = toJSON;
