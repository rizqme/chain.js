(function($){

$.Chain.service('chain', {
	init: function()
	{
		this.anchor = this.element;
		this.template = this.anchor.html();
		this.tplNumber = 0;
		this.builder = this.createBuilder();
		this.plugins = {};
		this.isActive = false;
		this.destroyers = [];
		
		this.element.addClass('chain-element');
	},
	
	handler: function(obj)
	{
		this.element.items('backup');
		this.element.item('backup');
		
		if(typeof obj == 'object')
			this.build(obj);
		else
			if(typeof obj == 'function')
				this.builder = this.createBuilder(obj);
		
		this.anchor.empty();
		
		this.isActive = true;
		this.element.update();
		
		return this.element;
	},
	
	build: function(rules)
	{
		var builder = rules.builder;
		delete rules.builder;
		
		if(rules.anchor)
			this.setAnchor(rules.anchor);
		delete rules.anchor;
		
		var override = rules.override;
		delete rules.override;
	
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
					val = rules[i].apply(self, [data, el]);
					if(typeof val == 'string')
						el.not(':input').html(val).end().filter(':input').val(val);
				}
				else if(typeof rules[i] == 'object')
				{
					for(var j in rules[i])
					{
						if (typeof rules[i][j] == 'function')
						{
							val = rules[i][j].apply(self, [data, el]);
							if(typeof val == 'string')
							{
								if(j == 'content')
									el.html(val);
								else if(j == 'text')
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
		
		var defBuilder = this.defaultBuilder;
	
		this.builder = function(root)
		{
			if(builder)
				builder.apply(this, [root]);
			
			if(!override)
				defBuilder.apply(this);
			
			this.update(fn);
			
			return false;
		};
	},
	
	// Builder, not executable
	defaultBuilder: function(builder, root)
	{
		var res = builder ? (builder.apply(this, [root]) !== false) : true;
		
		if(res)
			this.update(function(event, data){
				var self = $(this);
				for(var i in data)
					if(typeof data[i] != 'object' && typeof data[i] != 'function')
						self.find('> .'+i+', *:not(.chain-element) .'+i)
							.each(function(){
								var match = $(this);
								if(match.filter(':input').length)
									match.val(data[i]);
								else if(match.filter('img').length)
									match.attr('src', data[i]);
								else
									match.html(data[i]);
							});
			});
	},
	
	createBuilder: function(builder)
	{
		var defBuilder = this.defaultBuilder;
		return function(root){
			defBuilder.apply(this, [builder, root]);
			return false;
		};
	},
	
	setAnchor: function(anchor)
	{
		this.anchor.html(this.template);
		this.anchor = anchor == this.element ? anchor : this.element.find(anchor);
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
	
	$template: function(arg)
	{
		if(!arguments.length)
			return $('<div>').html(this.template).children().eq(this.tplNumber);
		
		if(arg == 'raw')
			return this.template;
		
		if(typeof arg == 'number')
		{
			this.tplNumber = arg;
		}
		else
		{
			var tpl = $('<div>').html(this.template).children();
			var node = tpl.filter(arg).eq(0);
			
			if(node.length)
				this.tplNumber = tpl.index(node);
			else
				return this.element;
		}
		
		this.element.items('backup');
		this.element.item('backup');
		this.element.update();
		
		return this.element;
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
		
		if(typeof fn == 'function')
			this.element.items(true).each(function(){
				var self = $(this);
				fn.call(self, self.item('root'));
			});
		
		this.element.update();
		
		return this.element;
	},
	
	$clone: function()
	{
		var id = this.element.attr('id');
		this.element.attr('id', '');
		
		var clone = this.element.clone().empty().html(this.template);
		this.element.attr('id', id);
		
		return clone;
	},
	
	$destroy: function(nofollow)
	{
		this.element.removeClass('chain-element');
		
		if(!nofollow)
		{
			this.element.items('backup');
			this.element.item('backup');
			
			this.element.find('.chain-element').each(function(){
				$(this).chain('destroy', true);
			});
		}
		
		this.element.triggerHandler('destroy');
	
		this.isActive = false;
	
		this.anchor.html(this.template);
		
		return this.element;
	}
});
	
})(jQuery);