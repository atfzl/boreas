function checkRanges(node, level)
{
    if (level === undefined)
        level = 0;

    //console.log('(%d):: %s -> %s', level, node.toString(), JSON.stringify(node.range));

    node.range.startLine.should.not.be.above(node.range.endLine);
    if (node.range.startLine === node.range.endLine)
        node.range.startColumn.should.not.be.above(node.range.endColumn);

    var children = node.getChildren();
    var len = children.length;
    var prevChild = null;

    for (var i = 0; i < len; i++)
    {
        var child = children[i];

        //console.log('(%d):: [%d] %s -> %s', level, i, child.toString(), JSON.stringify(child.range));

        child.range.startLine.should.not.be.below(node.range.startLine);
        child.range.endLine.should.not.be.above(node.range.endLine);

        if (child.range.startLine === node.range.startLine)
            child.range.startColumn.should.not.be.below(node.range.startColumn);
        if (child.range.endLine === node.range.endLine)
            child.range.endColumn.should.not.be.above(node.range.endColumn);

        if (prevChild !== null)
        {
            prevChild.range.endLine.should.not.be.above(child.range.startLine);
            if (prevChild.range.endLine === child.range.startLine)
                prevChild.range.endColumn.should.not.be.above(child.range.startColumn);
        }

        checkRanges(child, level + 1);

        prevChild = child;
    }
}


exports.checkRanges = checkRanges;