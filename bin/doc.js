// Documentation Generator
print('## DocScript Documentation Generator (c) 2008 Rizqi Ahmad ##');
print('preparing ...');

load('project.js');

load('bin/lib/utils.js');
load('bin/lib/textile.js');

load('bin/lib/docscript.js');
load('bin/lib/zparse.js');
load('bin/lib/tparser.js');

print('loading template file');
var template = readFile('bin/lib/template.html');

print('parsing template');
var parser = new ZParse(templateParser);
parser.parse(template);

var doc = new DocScript(project.name);
doc.description = project.description;
for(var i=0; i<project.sources.length; i++)
{
	print('parsing src/'+project.sources[i]);
	doc.parse(project.sources[i], readFile('src/'+project.sources[i]));
}

print('generating document structure');
doc.structurize();

print('writing files');
writeFile('doc/browser/docs.js', 'var docs = '+uneval(doc.docs)+';');
writeFile('doc/static/index.html', parser.process(doc));

print('done');