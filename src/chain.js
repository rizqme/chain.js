(function($){

$.Chain.service('chain', {
	init: function()
	{
		this.anchor = this.element;
		this.template = this.anchor.html();
		this.builder = this.createBuilder();
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
			var anchor = self.chain('anchor');
			for(var i in rules)
			{
				el = $(i, anchor);
			
				if (typeof rules[i] == 'function')
				{
					val = rules[i].apply(self, [data, el]);
					if(typeof val == 'string')
						el.text(val).val(val);
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
	
		this.builder = function(anchor)
		{
			if(builder)
				builder.apply(this, [anchor]);
			$(this).update(fn);
		};
	},
	
	// Builder, not executable
	defaultBuilder: function(builder, anchor)
	{
		var res = builder ? (builder.apply($(this), [anchor]) !== false) : true;
		
		if(res)
			$(this).update(function(event, data){
				for(var i in data)
				{
					if(typeof data[i] != 'object' && typeof data[i] != 'function')
						anchor.find('.'+i).text(data[i]).val(data[i]).end();
				}
			});
	},
	
	createBuilder: function(builder)
	{
		var defBuilder = this.defaultBuilder;
		return function(anchor){defBuilder.apply(this, [builder, anchor])};
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