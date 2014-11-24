var should = require('should');
var Fs = require('fs');
var Path = require('path');

var P = require('../lib/parser');


var dir = 'fixtures';

function checkFile(file)
{
    var src = Fs.readFileSync(file, 'utf8');
    var ast = new P.Parser(src).parseStyleSheet();

    ast.toString().should.eql(src);
}

describe('CSS Parser should parse and unparse', function()
{
    var files = Fs.readdirSync(dir);
    var len = files.length;

    for (var i = 0; i < len; i++)
    {
        var file = files[i];
        it(file, checkFile.bind(null, dir + Path.sep + file));
    }
});