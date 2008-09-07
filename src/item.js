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
			this.setData(obj);
			this.isActive = true;
			
			this.update();
			return this.element;
		}
		else if(typeof obj == 'function')
		{
			this.datafn = obj;
			
			return this.element;
		}
		
		if(this.isActive)
			return this.getData();
		else
			return false;
	},
	
	getData: function()
	{
		this.data = this.datafn.call(this.element, this.data);
		
		return this.data;
	},
	
	setData: function(obj)
	{
		var data;
		if($.Chain.jobject(obj) && obj.item())
			data = $.extend({}, obj.item());
		else if($.Chain.jobject(obj))
			data = {}
		else
			data = obj;
		
		this.data = this.datafn.call(this.element, this.data || data, data);
		if(this.linkElement && this.linkElement[0] != obj[0])
		{
			var el = this.linkFunction();
			if($.Chain.jobject(el) && el.length && el.item())
				el.item(this.data);
		}
	},
	
	dataHandler: function(a, b)
	{
		if(arguments.length == 2)
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
		// IE Fix
		var fix = this.element.chain('template', 'raw').replace(/jQuery\d+\=\"null\"/gi, "");
		this.element.chain('anchor').html(fix);
		
		if(!$.Chain.jidentic(this.root, this.element))
		{
			var plugins = this.root.chain('plugin');
			for(var i in plugins)
				plugins[i].apply(this.element, [this.root]);
			
		}
		
		this.element.chain('builder').apply(this.element, [this.root]);
		this.isBuilt = true;
		
		var self = this;
	},
	
	$update: function()
	{
		if(this.element.chain('active') && this.isActive && !this.isBuilt && this.getData())
			this.build();
		
		return this.element;
	},
	
	$replace: function(obj)
	{
		this.data = {};
		this.setData(obj);
		this.isActive = true;
		this.update();
		return this.element;
	},
	
	$remove: function(noupdate)
	{
		this.element.chain('destroy');
		this.element.remove();
		
		if(!$.Chain.jidentic(this.root, this.element) && !noupdate)
			this.root.update();
		
		if(this.$link)
			this.$link(null);
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
	},
	
	$link: function(element, collection)
	{
		if(this.linkElement)
		{
			this.linkElement.unbind('update', this.linkUpdater);
			this.linkElement = null;
		}
		
		element = $(element);
		if(element.length)
		{
			var self = this;
			this.isActive = true;
			this.linkElement = element;
			this.linkFunction = function()
			{
				if(typeof collection == 'function')
					try{return collection.call(self.element, self.linkElement)}catch(e){return $().eq(-1)}
				else if(typeof collection == 'string')
					return self.linkElement.items('collection', collection);
				else
					return $().eq(-1);
			};
			
			this.linkUpdater = function()
			{
				var res = self.linkFunction();
				if(res && res.length)
					self.element.item(res);
			};
			
			this.linkElement.bind('update', this.linkUpdater);
			this.linkUpdater();
		}
		
		return this.element;
	}
});

})(jQuery);