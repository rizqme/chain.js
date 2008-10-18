// Source Builder
print('## Source Builder (c) 2008 Rizqi Ahmad ##');
print('preparing ...');

load('project.js');

load('bin/lib/utils.js');
load('bin/lib/packer.js');

print('loading license file');
var license = '/**\n * '
	+project.name+'\n * '
	+project.description+'\n * \n * '
	+readFile('license.txt').split('\n').join('\n * ')+'\n */\n';

print('loading source files:');
var source = '';
for(var i=0; i<project.sources.length; i++)
{
	print('- '+project.sources[i]);
	source += '\n\n/* '+project.sources[i]+' */\n'+readFile('src/'+project.sources[i]);
}

print('packing data');
var packed = pack(source, 62, true, false);

print('writing files');
writeFile('build/chain.js', license+source);
writeFile('build/chain-'+project.version+'.js', license+source);
writeFile('build/chain-'+project.version+'.pack.js', license+packed);

print('done');