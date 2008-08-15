/* This file is automatically generated */

/*

Copyright (c) 2008 Rizqi Ahmad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 

*/

/* core.js */
(function($){
	
$.Chain = 
{
	version: '0.1',
	
	tag: ['{', '}'],
	
	services: {},
	
	service: function(name, proto)
	{
		this.services[name] = proto;
		
		$.fn[name] = function(options)
		{
			if(!this.length) return this;
			
			var instance = this.data('chain-'+name);
			var args = Array.prototype.slice.call(arguments, 1);
			
			if(!instance)
			{
				instance = $.extend({element: this}, $.Chain.services[name]);
				this.data('chain-'+name, instance);
				if(instance.init)
					instance.init();
			}
			
			var result;
			
			if(typeof options == 'string' && instance['$'+options])
				result = instance['$'+options].apply(instance, args);
			else if(instance['handler'])
				result = instance['handler'].apply(instance, [options].concat(args));
			else
				result = this;
			
			if(options == 'destroy')
				this.removeData('chain-'+name);
			
			return result;
		};
	},
	
	extend: function(name, proto)
	{
		if(this.services[name])
			this.services[name] = $.extend(this.services[name], proto);
	},
	
	jobject: function(obj)
	{
		return obj && obj.init == $.fn.init;
	},
	
	jidentic: function(j1, j2)
	{
		if(!j1 || !j2 || j1.length != j2.length)
			return false;
		
		a1 = j1.get();
		a2 = j2.get();
		
		for(var i=0; i<a1.length; i++)
			if(a1[i] != a2[i])
				return false;
		
		return true;
		
	},
	
	parse: (function()
	{
		// Function Closure
		var closure =
		[
			'var $text = [];\n'
			+'$text.print = function(text)'
			+'{this.push((typeof text == "number") ? text : ((typeof text != "undefined") ? text : ""));};\n'
			+'with($data){\n',
	
			'}\nreturn $text.join("");'
		];
	
		// Print text template
		var textPrint = function(text)
		{
			return '$text.print("'
				+text.split('\\').join('\\\\').split("'").join("\\'").split('"').join('\\"')
				+'");';
		};
	
		// Print script template
		var scriptPrint = function(text)
		{
			return '$text.print('+text+');';
		};
	
	
		/*
		 * Real function begins here.
		 * We use closure for private variables and function.
		 */
		return function(text)
		{
			// Printing tag
			var tag = $.Chain.tag;
			
			var opener, closer, closer2 = null, result = [];
		
			while(text){
			
				// Check where the opener and closer tag
				// are located in the text.
				opener = text.indexOf(tag[0]);
				closer = opener + text.substring(opener).indexOf(tag[1]);
			
				// If opener tag exists, otherwise there are no tags anymore
				if(opener != -1){
					// Handle escape. Tag can be escaped with '\\'.
					// If tag is escaped. it will be handled as a normal text
					// Otherwise it will be handled as a script
					if(text[opener-1] == '\\'){
						closer2 = opener+tag[0].length + text.substring(opener+tag[0].length).indexOf(tag[0]);
						if(closer2 != opener+tag[0].length-1 && text[closer2-1] == '\\')
							closer2 = closer2-1;
						else if(closer2 == opener+tag[0].length-1)
							closer2 = text.length;
					
						result.push(textPrint(text.substring(0, opener-1)));
						result.push(textPrint(text.substring(opener, closer2)));
					}
					else{
						closer2 = null;
						if(closer == opener-1)
							closer = text.length;
					
						result.push(textPrint(text.substring(0, opener)));
						result.push(scriptPrint(text.substring(opener+tag[0].length, closer)));
					}
						
					text = text.substring((closer2 == null) ? closer+tag[1].length : closer2);
				}
				// If there are still text, it will be pushed to array
				// So we won't stuck in an infinite loop
				else if(text){
					result.push(textPrint(text));
					text = '';
				}
			}
		
			var fn;
			// The parsed text will be transformed to a function.
			// Exception handler is handling errors in parsing
			// so, it won't make the whole program crash.
			try{
				fn = new Function('$data', closure[0]+result.join('\n')+closure[1]);
			}catch(e){
				throw 'error in parsing rules';
				fn = function(){};
			}
		
			fn.parsed = true;
		
			return fn;
		};
	})()
};
	
})(jQuery);


/* update.js */
(function($){

$.Chain.service('update', {
	handler: function(obj)
	{
		if(typeof obj == 'function')
			return this.bind(obj);
		else
			return this.trigger();
	},
	
	bind: function(fn)
	{
		return this.element.bind('update', fn);
	},
	
	trigger: function()
	{
		this.element.items('update');
		this.element.item('update');
		
		this.element.triggerHandler('preupdate', this.element.item());
		this.element.triggerHandler('update', this.element.item());
		
		return this.element;
	}
});
	
})(jQuery);


/* chain.js */
(function($){

$.Chain.service('chain', {
	init: function()
	{
		this.anchor = this.element;
		this.template = this.anchor.html();
		this.builder = this.defaultBuilder;
		this.plugins = {};
		this.isActive = false;
	},
	
	handler: function(obj)
	{
		this.element.items('backup');
		this.element.item('backup');
		
		if(typeof obj == 'object')
		{
			this.build(obj);
		}
		else
		{
			if(typeof obj == 'function')
				this.builder = this.createBuilder(obj);
			this.anchor.empty();
		}
		
		this.isActive = true;
		this.element.update();
		
		return this.element;
	},
	
	build: function(rules)
	{
		var builder = rules.builder;
		delete rules.builder;
		
		this.setAnchor(rules.anchor);
		delete rules.anchor;
	
		for(var i in rules)
		{
			if(typeof rules[i] == 'string')
			{
				rules[i] = $.Chain.parse(rules[i]);
			}
			else if(typeof rules[i] == 'object')
			{
				for(var j in rules[i])
				{
					if(typeof rules[i][j] == 'string')
						rules[i][j] = $.Chain.parse(rules[i][j]);
				}
			}
		}
	
		var fn = function(event, data)
		{
			var el, val;
			var self = $(this);
			for(var i in rules)
			{
				el = $(i, self);
			
				if (typeof rules[i] == 'function')
				{
					val = rules[i].apply(self, [data]);
					if(typeof val == 'string')
						el.text(val).val(val);
				}
				else if(typeof rules[i] == 'object')
				{
					for(var j in rules[i])
					{
						if (typeof rules[i][j] == 'function')
						{
							val = rules[i][j].apply(self, [data]);
							if(typeof val == 'string')
							{
								if(j == 'content')
									el.text(val);
								else if(j == 'value')
									el.val(val);
								else if(j == 'class' || j == 'className')
									el.addClass(val);
								else
									el.attr(j, val);
							}
							
						}
					}
				}
			}
		};
	
		this.builder = function()
		{
			if(builder)
				builder.apply($(this));
			$(this).update(fn);
		};
	},
	
	// Builder, not executable
	defaultBuilder: function(builder)
	{
		var res = builder ? (builder.apply($(this)) !== false) : true;
		
		if(res)
			$(this).update(function(event, data){
				var self = $(this);
				for(var i in data)
				{
					if(typeof data[i] != 'object' && typeof data[i] != 'function')
						self.find('.'+i).text(data[i]).val(data[i]).end();
				}
			});
	},
	
	createBuilder: function(builder)
	{
		var defBuilder = this.defaultBuilder;
		return function(){defBuilder.apply(this, [builder])};
	},
	
	setAnchor: function(anchor)
	{
		this.anchor.html(this.template);
		this.anchor = $(anchor || this.anchor);
		this.template = this.anchor.html();
		this.anchor.empty();
	},
	
	$anchor: function(val)
	{
		if(val)
		{
			this.element.items('backup');
			this.element.item('backup');
			
			this.setAnchor(val);
			this.element.update();
			
			return this.element;
		}
		else
		{
			return this.anchor;
		}
	},
	
	$template: function()
	{
		return this.template;
	},
	
	$builder: function(builder)
	{
		if(builder)
			return this.handler(builder);
		else
			return this.builder;
	},
	
	$active: function()
	{
		return this.isActive;
	},
	
	$plugin: function(name, fn)
	{
		if(fn === null)
			delete this.plugins[name];
		else if(typeof fn == 'function')
			this.plugins[name] = fn;
		else if(name && !fn)
			return this.plugins[name];
		else
			return this.plugins;
		
		this.element.items('backup');
		this.element.item('backup');
		
		this.element.update();
		
		return this.element;
	},
	
	$destroy: function()
	{
		this.element.items('backup');
		this.element.item('backup');
		
		this.isActive = false;
		
		this.anchor.html(this.template);
	}
});
	
})(jQuery);


/* items.js */
(function($){

$.Chain.service('items', {
	init: function()
	{
		this.isActive = false;
		this.buffer = [];
	},
	
	handler: function(obj)
	{
		if(obj instanceof Array)
			return this.$merge(obj);
		else if($.Chain.jobject(obj))
			return (!$.Chain.jidentic(obj, obj.item('root')) && $.Chain.jidentic(this.element, obj.item('root')))
				? obj : $().eq(1);
		else if(typeof obj == 'object')
			return this.getByData(obj);
		else if(typeof obj == 'number')
			return this.getByNumber(obj);
		else if(obj === true)
			return this.element.chain('anchor').children('.chain-item');
		else
			return this.element.chain('anchor').children('.chain-item:visible');
	},
	
	getByData: function(item)
	{
		return this.element.chain('anchor').children()
			.filter(function(){return $(this).item() == item});
	},
	
	getByNumber: function(number)
	{
		if(number == -1)
			return this.element.chain('anchor').children(':last');
		else
			return this.element.chain('anchor').children(':eq('+number+')');
	},
	
	update: function()
	{
		this.element.update();
	},
	
	empty: function()
	{
		this.element.chain('anchor').empty();
	},
	
	$update: function()
	{
		if(!this.element.chain('active') || !this.isActive)
			return this.element;
		
		var self = this;
		var builder = this.element.chain('builder');
		var template = $(this.element.chain('template'));
		
		$.each(this.buffer, function(){
			template
				.clone()
				.appendTo(self.element.chain('anchor'))
				.addClass('chain-item')
				.item('root', self.element)
				.item(this)
				.chain(builder);
		});
		
		this.buffer = [];
		
		return this.element;
	},
	
	$add: function()
	{
		this.isActive = true;
		this.buffer = this.buffer.concat(Array.prototype.slice.call(arguments));
		this.update();
		
		return this.element;
	},
	
	$merge: function(items)
	{
		this.isActive = true;
		
		if($.Chain.jobject(items))
			this.buffer = this.buffer.concat(items.map(function(){return $(this).item()}).get());
		else if(items instanceof Array)
			this.buffer = this.buffer.concat(items);
		this.update();
		
		return this.element;
	},
	
	$replace: function(items)
	{
		this.isActive = true;
		this.empty();
		
		if($.Chain.jobject(items))
			this.buffer = items.map(function(){return $(this).item()}).get();
		else if(items instanceof Array)
			this.buffer = items;
		
		this.update();
		
		return this.element;
	},
	
	$remove: function()
	{
		for(var i=0; i<arguments.length; i++)
			this.handler(arguments[i]).remove();
		this.update();
		
		return this.element;
	},
	
	$reorder: function(item1, item2)
	{
		this.handler(item1).before(this.handler(item2));
		this.update();
		
		return this.element;
	},
	
	$empty: function()
	{
		this.empty();
		this.buffer = [];
		this.update();
		
		return this.element;
	},
	
	$data: function(x)
	{
		return this.handler(x).map(function(){return $(this).item();}).get();
	},
	
	$active: function()
	{
		return this.isActive;
	},
	
	$backup: function()
	{
		if(!this.element.chain('active') || !this.isActive)
			return;
		
		var buffer = [];
		this.element.chain('anchor').children().each(function(){
			var item = $(this).item();
			if(item)
				buffer.push(item);
		});
		this.buffer = buffer.concat(this.buffer);
		
		this.empty();
		
		return this.element;
	},
	
	$destroy: function()
	{
		this.empty();
		return this.element;
	}
});

// Filtering extension
$.Chain.extend('items', {
	doFilter: function()
	{
		var props = this.searchProperties;
		var text = this.searchText;
		
		if(text)
		{
			var items = this.element.items(true).filter(function(){
				var data = $(this).item();
				if(props)
				{
					for(var i=0; i<props.length; i++)
						if(typeof data[i] == 'string' && !!data[i].match(text))
							return true;
				}
				else
				{
					for(var i in data)
						if(typeof data[i] == 'string' && !!data[i].match(text))
							return true;
				}
			});
			this.element.items(true).not(items).hide();
			items.show();
		}
		else
		{
			this.element.items(true).show();
			this.element.unbind('preupdate', this.searchBinding);
			this.searchBinding = null;
		}
	},
	
	$filter: function(text, properties)
	{
		if(!text && text !== null && text !== false)
			return this.update();
		
		this.searchText = text;
		
		if(typeof properties == 'text')
			this.searchProperties = [properties];
		else if(properties instanceof Array)
			this.searchProperties = properties;
		else
			this.searchProperties = null;
		
		if(!this.searchBinding)
		{
			var self = this;
			this.searchBinding = function(event, item){self.doFilter();};
			this.element.bind('preupdate', this.searchBinding);
		}
		
		return this.update();
	}
});

// Sorting extension
$.Chain.extend('items', {
	doSort: function()
	{
		var name = this.sortName;
		var opt = this.sortOpt;
		
		var sorter = 
		{
			'number': function(a, b){
				return parseFloat(($(a).item()[name]+'').match(/\d+/gi)[0])
					> parseFloat(($(b).item()[name]+'').match(/\d+/gi)[0]);
			},
		
			'default': function(a, b){
				return $(a).item()[name] > $(b).item()[name];
			}
		};
		
		if(name)
		{
			var array = this.element.items(true).get().sort(sorter[opt.type] || sorter['default']);
			
			array = opt.desc ? array.reverse() : array;
			
			for(var i=0; i<array.length; i++)
				this.element.chain('anchor').append(array[i]);
			
			opt.desc = opt.toggle ? !opt.desc : opt.desc;
		}
		else
		{
			this.element.unbind('preupdate', this.sortBinding);
			this.sortBinding = null;
		}
	},
	
	$sort: function(name, opt)
	{
		if(!name && name !== null && name !== false)
			return this.update();
		
		this.sortName = name;
		this.sortOpt = $.extend({desc:false, type:'default', toggle:false}, opt);
		
		if(!this.sortBinding)
		{
			var self = this;
			this.sortBinding = function(event, item){self.doSort();};
			this.element.bind('preupdate', this.sortBinding);
		}
		
		return this.update();
	}
})

// Linking extension
$.Chain.extend('items', {
	$link: function(element, fn)
	{
		if(this.linkElement)
			this.linkElement.unbind('update', this.linkFunction);
		
		element = $(element);
		if(element.length && typeof fn == 'function')
		{
			var self = this;
			this.linkElement = element;
			this.linkFunction = function()
			{
				try{self.$replace(fn.apply(self.element, [self.linkElement]));}catch(e){self.$empty()}
			};
			
			this.linkElement.bind('update', this.linkFunction);
			this.linkFunction();
		}
		
		return this.element;
	}
});
	
})(jQuery);


/* item.js */
(function($){

$.Chain.service('item', {
	init: function()
	{
		this.isActive = false;
		this.isBuilt = false;
		this.root = this.element;
		this.data = false;
		this.datafn = this.dataHandler;
	},
	
	handler: function(obj)
	{
		if(typeof obj == 'object')
		{
			this.data = this.datafn.call(this.element, this.data || obj, obj);
			this.isActive = true;
			
			this.update();
			
			return this.element;
		}
		else if(typeof obj == 'function')
		{
			this.datafn = obj;
			this.update();
		}
		
		if(this.isActive)
			return this.callData();
		else
			return false;
	},
	
	callData: function()
	{
		return this.datafn.call(this.element, this.data);
	},
	
	dataHandler: function(a, b)
	{
		if(b)
			return $.extend(a, b);
		else
			return a;
	},
	
	update: function()
	{
		return this.element.update();
	},
	
	build: function()
	{
		this.element.chain('anchor').html(this.element.chain('template'));
		
		if(!$.Chain.jidentic(this.root, this.element))
		{
			var plugins = this.root.chain('plugin');
			for(var i in plugins)
				plugins[i].apply(this.element);
			
		}
		
		this.element.chain('builder').apply(this.element.chain('anchor'));
		this.isBuilt = true;
		
		var self = this;
	},
	
	$update: function()
	{
		if(this.element.chain('active') && this.isActive && !this.isBuilt && this.callData())
			this.build();
		
		return this.element;
	},
	
	$replace: function(obj)
	{
		this.data = obj;
		this.isActive = true;
		return this.element;
	},
	
	$remove: function()
	{
		this.element.remove();
		if(this.root)
			this.root.update();
		this.root = null;
	},
	
	$active: function()
	{
		return this.isActive;
	},
	
	$root: function(val)
	{
		if(arguments.length)
		{
			this.root = val;
			this.update();
			return this.element;
		}
		else
		{
			return this.root;
		}
	},
	
	$backup: function()
	{
		this.isBuilt = false;
	}
});

// Linking extension
$.Chain.extend('item', {
	$link: function(element, fn)
	{
		if(this.linkElement)
		{
			this.datafn = this.linkDataFn || this.dataHandler;
			this.linkElement.unbind('update', this.linkFunction);
		}
		
		element = $(element);
		if(element.length && typeof fn == 'function')
		{
			var self = this;
			
			this.isActive = true;
			this.linkElement = element;
			this.linkDataFn = this.datafn;
			
			this.datafn = function()
			{
				try{return $.extend({}, fn.apply(self.element, [self.linkElement]));}catch(e){return {};};
			};
			this.linkFunction = function()
			{
				self.update();
			};
			
			this.linkElement.bind('update', this.linkFunction);
		}
		
		return this.element;
	}
});
	
})(jQuery);

