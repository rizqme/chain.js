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
		
		this.element.chain('builder').apply(this.element);
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