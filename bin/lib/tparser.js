
var templateParser = {
	statement: {
		opener: '<!--:',
		closer: ':-->',
		
		tags: {
			
			'each': {
				arguments: '{element} in {object}',
				type: 'block',
				handler: function(tree, content, caller) {
					var element = tree.arguments.element;
					var object = tree.arguments.object;
					
					//Check whether there are else tag after this tag, if yes, (if) tag will be included
					var cond = (tree.parent.children[tree.nr+1] && tree.parent.children[tree.nr+1].tagname == 'else');
					var iff = ['if( (',object,' instanceof Array && ',object,'.length > 0) || ',
								'(!(',object,' instanceof Array) && ',object,') ) {'].join('');
					return [
						cond?iff:'',
							'var ',element,';',
							'if(',object,' instanceof Array) {',
								'for(var ',element,'_index=0; ',element,'_index<',object,'.length; ',element,'_index++) {',
									element,' = ',object,'[',element,'_index];',
									content,
								'}',
							'} else {',
								'for (var ',element,'_index in ',object,') {',
									element,' = ',object,'[',element,'_index];',
									content,
								'}',
							'}',
						cond?'}':''
					].join('');
				}
			},
			
			'for': {
				arguments: '{element} in {object}',
				type: 'block',
				handler: function(tree, content, caller) {
					var element = tree.arguments.element;
					var object = tree.arguments.object;
					
					//Check whether there are else tag after this tag, if yes, (if) tag will be included
					var cond = (tree.parent.children[tree.nr+1] && tree.parent.children[tree.nr+1].tagname == 'else');
					var iff = ['if( (',object,' instanceof Array && ',object,'.length > 0) || ',
								'(!(',object,' instanceof Array) && ',object,') ) {'].join('');
					return [
						cond?iff:'',
							'if(',object,' instanceof Array) {',
								'for(var ',element,'=0; ',element,'<',object,'.length; ',element,'++) {',
									content,
								'}',
							'} else {',
								'for(var ',element,' in ',object,') {',
									content,
								'}',
							'}',
						cond?'}':''
					].join('');
				}
			},
			
			'if': {
				type: 'block',
				
				handler: function(tree, content, caller) {
					var condition = tree.argSource;
					
					return [
						'if(',condition,') {',
							content,
						'}'
					].join('');
				}
			},
			
			'elseif': {
				type: 'block',
				noTextBefore: true,
				
				handler: function(tree, content, caller) {
					var condition = tree.argSource;
					
					return [
						'else if(',condition,') {',
							content,
						'}'
					].join('');
				}
			},
			
			'else': {
				type: 'block',
				noTextBefore: true,
				
				handler: function(tree, content, caller) {
					return [
						'else {',
							content,
						'}'
					].join('');
				}
			},
			
			'macro': {
				arguments: '{name}({args})',
				type: 'block',
				handler: function(tree, content, caller) {
					var name = tree.arguments.name;
					var args = tree.arguments.args;
					
					var point = (name.indexOf('.') > 0);
					return [
						point?'':'var ', name,' = function(',args,') {',
							'var $text = [];',
							'var _write = function(text) {',
								'$text.push((typeof text == "number")?text:(text||""));',
							'};',
							content,
							'return $text.join("");',
						'};'
					].join('');
				}
			},
			
			'cdata': {
				type: 'block',
				handler: function(tree, content, caller) {
					return '_write(\''+ZParse.escape(tree.innerSource, caller.escapeChars)+'\');';
				}
			}
		}
	},
	
	print: {
		opener: '${',
		closer: '}',
		handler: function(tree, content, caller) {
			return '_write('+tree.argSource+');';
		}
	},
	
	alternatePrint: {
		opener: '<!--$',
		closer: ':-->',
		handler: function(tree, content, caller) {
			return '_write('+tree.argSource+');';
		}
	},
	
	script: {
		opener: '<!--%',
		closer: '%-->',
		handler: function(tree, content, caller) {
			return tree.argSource;
		}
	}
};