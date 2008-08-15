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
		if(item2)
			this.handler(item1).before(this.handler(item2));
		else
			this.handler(item1).appendTo(this.element.chain('anchor'));
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
			var sortfn = opt.fn || sorter[opt.type] || sorter['default'];
				
			var array = this.element.items(true).get().sort(sortfn);
			
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
});

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