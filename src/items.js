(function($){

$.Chain.service('items', {
	collections: 
	{
		all: function()
		{
			return this.element.chain('anchor').children('.chain-item');
		},
		
		visible: function()
		{
			return this.element.chain('anchor').children('.chain-item:visible');
		},
		
		hidden: function()
		{
			return this.element.chain('anchor').children('.chain-item:hidden');
		},
		
		self: function()
		{
			return this.element;
		}
	},
	
	init: function()
	{
		this.isActive = false;
		this.buffer = [];
		this.collections = $.extend({}, this.collections);
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
			return this.collection('all');
		else
			return this.collection('visible');
	},
	
	getByData: function(item)
	{
		return this.collection('all').filter(function(){return $(this).item() == item});
	},
	
	getByNumber: function(number)
	{
		if(number == -1)
			return this.collection('visible').filter(':last');
		else
			return this.collection('visible').eq(number);
	},
	
	update: function()
	{
		this.element.update();
	},
	
	empty: function()
	{
		var all = this.collection('all');
		
		// Make it run in the background. for responsiveness.
		setTimeout(function(){all.each(function(){$(this).item('remove', true)});}, 1);
		
		this.element.chain('anchor').empty();
	},
	
	collection: function(col, fn)
	{
		if(arguments.length > 1)
		{
			if(typeof fn == 'function')
				this.collections[col] = fn;
			
			return this.element;
		}
		else
		{
			if(this.collections[col])
				return this.collections[col].apply(this);
			else
				return $().eq(-1);
		}
		
	},
	
	$update: function()
	{
		if(!this.element.chain('active') || !this.isActive)
			return this.element;
		
		var self = this;
		var builder = this.element.chain('builder');
		var template = $(this.element.chain('template')).eq(0);
		
		$.each(this.buffer, function(){
			var clone = template
				.clone()
				.appendTo(self.element.chain('anchor'))
				.addClass('chain-item')
				.item('root', self.element);
			
			if(self.linkElement && $.Chain.jobject(this) && this.item())
				clone.item('link', this, 'self');
			else
				clone.item(this);
			
			clone.chain(builder);
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
			this.buffer = this.buffer.concat(items.map(function(){return $(this)}).get());
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
			this.buffer = items.map(function(){return $(this)}).get();
		else if(items instanceof Array)
			this.buffer = items;
		
		this.update();
		
		return this.element;
	},
	
	$remove: function()
	{
		for(var i=0; i<arguments.length; i++)
			this.handler(arguments[i]).item('remove', true);
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
				self.element.items('replace', self.linkFunction());
			};
			
			this.linkElement.bind('update', this.linkUpdater);
			this.linkUpdater();
		}
		
		return this.element;
	},
	
	$collection: function()
	{
		return this.collection.apply(this, Array.prototype.slice.call(arguments));
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
		this.collection('all').each(function(){
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
			if(typeof text == 'string')
				text = text.toLowerCase();
			
			var items = this.element.items(true).filter(function(){
				var data = $(this).item();
				if(props)
				{
					for(var i=0; i<props.length; i++)
						if(typeof data[i] == 'string'
							&& !!(typeof text == 'string' ? data[i].toLowerCase() : data[i]).match(text))
							return true;
				}
				else
				{
					for(var i in data)
						if(typeof data[i] == 'string'
							&& !!(typeof text == 'string' ? data[i].toLowerCase() : data[i]).match(text))
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
		if(arguments.length == 0)
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
		
		if(this.sortName != name)
			this.sortOpt = $.extend({desc:false, type:'default', toggle:false}, opt);
		else
			$.extend(this.sortOpt, opt);
		
		this.sortName = name;
		
		if(!this.sortBinding)
		{
			var self = this;
			this.sortBinding = function(event, item){self.doSort();};
			this.element.bind('preupdate', this.sortBinding);
		}
		
		return this.update();
	}
});
	
})(jQuery);