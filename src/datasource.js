(function($){

var hasChanged = function(a,)
	
$.Chain.DataSource = function()
{
	
};

$.Chain.DataObject = function(data)
{
	this.data = $.extend({}, data);
};

$.extend($.Chain.DataObject.prototype, {
	set: function(name, value)
	{
		var all, data, changed = false;
		
		if(arguments.length == 1)
		{
			data = name;
			all = true;
		}
		else
		{
			data = {};
			data[name] = value;
		}
		
		for(var i in data)
		{
			if(data[i] != this.data[i])
			{
				this.data[i] = data[i];
				this.trigger(i);
				changed = true;
			}
		}
		
		if(changed)
		{
			this.trigger('*');
		}
	},
	
	get: function(name)
	{
		if(name)
		{
			return this.data[name];
		}
		else
		{
			return $.extend({}, this.data);
		}
	},
	
	match: function(name, value)
	{
		var data;
		
		if(arguments.length == 1)
		{
			data = name;
		} 
		else
		{
			data = {};
			data[name] = value;
		}
		
		for(var i in data)
		{
			if(data[i] != this.data[i])
			{
				return false;
			}
		}
		
		return true;
	},
	
	bind: function(obj)
	{
		
	},
	
	unbind: function(obj)
	{
		
	},
	
	listen: function(name, fn)
	{
		
	},
	
	unlisten: function(name, fn)
	{
		
	},
	
	trigger: function(name, data)
	{
		
	}
});
	
})(jQuery);