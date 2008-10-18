
var DocScript;

(function(){

DocScript = function(name, parser, structurizer)
{
	this.name = name;
	this.parser = parser || DocScript.parser.standard;
	this.structurizer = structurizer || DocScript.structurizer.standard;
	this.sources = {};
	this.docs = [];
	this.tree = {};
};

DocScript.prototype.parse = function(name, script)
{
	this.sources[name] = script;
	var rawdocs = DocScript.extractDocs(script);
	
	var docs = [];
	for(var i=0; i<rawdocs.length; i++)
	{
		var doc = DocScript.parseDoc(rawdocs[i], this.parser);
		doc.source = name;
		docs.push(doc);
	}
	
	this.docs = this.docs.concat(docs);
};

DocScript.prototype.structurize = function()
{
	this.tree = this.structurizer(this.docs);
};

DocScript.extractDocs = function(script)
{
	var opener, closer;
	var rawdocs = [];
	while (script)
	{
		opener = script.indexOf('\/\*\*') + 3;
		
		if (opener > 2)
		{
			script = script.substring(opener);
			closer = script.indexOf('\*\/');
			rawdocs.push(script.substring(0, closer).replace(/\*\\\//g, '\*\/'));
			script = script.substring(closer+2);
		}
		else
		{
			script = '';
		}
	}
	
	return rawdocs;
};

DocScript.parseDoc = function (rawdoc, parser)
{
	var content, tag = '@description';
	var lines = rawdoc.split('\n');
	var doctags = {};
	
	for (var i=0; i<lines.length; i++)
	{
		var match = lines[i].match(/^\s*\*\s(\@\w+)?(\s*(.*))$/);
		if (match)
		{
			tag = match[1] || tag;
			content = match[1] ? match[3] : match[2];
			
			if (!doctags[tag])
				doctags[tag] = [[content]];
			else if (match[1])
				doctags[tag].push([content]);
			else
				doctags[tag][doctags[tag].length-1].push(content);
		}
	}
	
	var doc = {type:"Method"};
	for (var i in doctags)
		if(parser[i])
			parser[i](doc, doctags[i]);
	
	return doc;
};

DocScript.parser = {};
DocScript.parser.standard =
{
	'@description': function (doc, content)
	{
		doc.description = content[0] ? content[0].join(' ') : '';
	},
	
	'@alias': function (doc, content)
	{
		for (var i=0; i<content.length; i++)
			content[i] = content[i][0];
		doc.aliases = content;
	},
	
	'@author': function (doc, content)
	{
		if (!content[0][0])
			return;
		
		var array = content[0][0].split(/\s+/);
		doc.author = {name:array[0], email:array[1]};
	},
	
	'@constructor': function (doc, content)
	{
		doc.type = "Constructor";
	},
	
	'@deprecated': function (doc, content)
	{
		doc.deprecated = true;
	},
	
	'@example': function (doc, content)
	{
		doc.examples = [];
		
		for (var i=0; i<content.length; i++)
		{
			doc.examples[i] =
			{
				title: content[i].shift(),
				code: content[i].join('\n')
			};
		}
	},
	
	'@exception': function (doc, content)
	{
		var match;
		doc.exceptions = [];
		
		for (var i=0; i<content.length; i++)
		{
			match = content[i].join(' ').match(/^\{(.*)\}\s*(.*)\s*$/);
			if(!match)
				return;
			doc.exceptions[i] = {type: match[1], description: match[2]};
		}
	},
	
	'@method': function (doc, content)
	{
		doc.type = "Method";
	},
	
	'@namespace': function (doc, content)
	{
		doc.type = "Namespace";
	},
	
	'@param': function (doc, content)
	{
		var match;
		doc.parameters = [];
		
		for (var i=0; i<content.length; i++)
		{
			match = content[i].join(' ').match(/^\{(.*)\}\s+(\w+)\s*(.*)\s*$/);
			if(!match)
				return;
			doc.parameters[i] = {name:match[2], types: match[1].split(/\s*\,\s*/), description: match[3]};
		}
	},
	
	'@property': function (doc, content)
	{
		var match = content[0][0].match(/^{(\w+)}$/);
		if(!match)
			return;
		doc.type = match[1];
	},
	
	'@return': function (doc, content)
	{
		var match = content[0].join(' ').match(/^{(.*)}\s*(.*)\s*$/);
		if(!match)
			return;
		doc['return'] = {types: match[1].split(/\s*\,\s*/), description: match[2]};
	},
	
	'@see': function (doc, content)
	{
		doc.see = content[0];
	},
	
	'@since': function (doc, content)
	{
		doc.since = content[0][0];

	},
	
	'@type': function (doc, content)
	{
		var match = content[0][0].match(/^{(\w+)}$/);
		if(!match)
			return;
		doc.type = match[1];
	}
};

DocScript.structurizer = {};

var extend = function(target, source)
{
	for(var i in source)
		target[i] = source[i];
	return target;
};

var exclude = function(array, item)
{
	var results = [];
	for(var i=0; i<array.length; i++)
		if(array[i] != item)
			results.push(array[i]);
	return results;
};

var getDoc = function(name, root, ext)
{
	var match = name.match(/^([\w\.\$]+)(\(.*\))?$/);
	if(!match)
		return false;
	
	var alias = match[1].split('.');
	var routine = match[2];
	
	var child, parent, doc = {};
	
	if(routine)
	{
		doc.name = alias[alias.length-1]+routine;
		child = 'routines';
		parent = getDoc(alias.join('.'), root);
	}
	else
	{
		doc.name = alias.pop();
		doc.parent = alias.join('.');
		if(alias[alias.length-1] == 'prototype')
		{
			doc['prototype'] = !!alias.pop();
			child = 'prototypes';
			parent = alias.length ? getDoc(alias.join('.'), root) : root;
		}
		else
		{
			child = 'properties';
			parent = alias.length ? getDoc(alias.join('.'), root) : root;
		}
		
	}
	
	if(!parent)
		return false;
	
	parent[child] = parent[child] || [];
	for(var i=0; i<parent[child].length; i++)
		if(parent[child][i].name == doc.name)
			return parent[child][i];
	
	parent[child].push(doc);
	
	if(ext)
		doc.ext = true;
	return extend(doc, ext);
};

var simplify = function(tree, root)
{
	root = root || tree;
	
	if(!tree.ext && !tree.routines && !tree.prototypes && tree.properties)
	{
		var parent = getDoc(tree.parent, root) || root;
		
		for(var i=0; i<tree.properties.length; i++)
		{
			var doc = tree.properties[i];
			doc.name = tree.name+'.'+doc.name;
			doc.parent = tree.parent;
			parent.properties = parent.properties || [];
			parent.properties.push(doc);
			simplify(doc, root);
		}
		
		parent.properties = exclude(parent.properties, tree);
	}
	
	else if(tree.properties)
	{
		for(var i=0; i<tree.properties.length; i++)
			simplify(tree.properties[i], root);
	}
}

DocScript.structurizer.standard = function(docs)
{
	var newdocs = {ext:true};
	for(var i=0; i<docs.length; i++)
	{
		if(!docs[i].aliases)
			continue;
		
		for(var j=0; j<docs[i].aliases.length; j++)
		{
			var doc = getDoc(docs[i].aliases[j], newdocs, docs[i]);
			
			if(!doc)
				continue;
			
			var aliases = [];
			for(var k=0; k<docs[i].aliases.length; k++)
				if(docs[i].aliases[k] != docs[i].aliases[j])
					aliases.push(docs[i].aliases[k]);
			doc.aliases = aliases;
		}
	}
	
	simplify(newdocs);
	
	return newdocs.properties;
};

})();