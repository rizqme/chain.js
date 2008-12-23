/**
 * Chain Items Service.
 * Method to bind items to object.
 * 
 * @alias items
 * 
 * @syntax $(selector).items(parameters);
 */ 

(function($){

/**
 * Chain Items Manager - Providing methods of @items@.
 * All method listed here can only be used internally
 * using @jQuery.Chain.service@ or @jQuery.Chain.extend@
 * 
 * @namespace
 * 
 * @alias jQuery.Chain.services.items
 * 
 * @see jQuery.Chain.service
 * @see jQuery.Chain.extend
 */ 

$.Chain.service('items', {
	/**
	 * Collection of Function for getting items
	 * 
	 * @namespace
	 * @alias jQuery.Chain.services.items.collections
	 * 
	 * @see jQuery.Chain.services.items.collection
	 */ 
	collections: 
	{
		/**
		 * Get all items, including hidden
		 * 
		 * @alias jQuery.Chain.services.items.collections.all
		 * 
		 * @return {Object} jQuery Object containing items
		 */ 
		all: function()
		{
			return this.element.chain('anchor').children('.chain-item');
		},
		
		/**
		 * Get all visible items
		 * 
		 * @alias jQuery.Chain.services.items.collections.visible
		 * 
		 * @return {Object} jQuery Object containing items
		 */ 
		visible: function()
		{
			return this.element.chain('anchor').children('.chain-item:visible');
		},
		
		/**
		 * Get all hidden items
		 * 
		 * @alias jQuery.Chain.services.items.collections.hidden
		 * 
		 * @return {Object} jQuery Object containing items
		 */ 
		hidden: function()
		{
			return this.element.chain('anchor').children('.chain-item:hidden');
		},
		
		/**
		 * Get self
		 * 
		 * @alias jQuery.Chain.services.items.collections.self
		 * 
		 * @return {Object} jQuery Object of the element
		 */ 
		self: function()
		{
			return this.element;
		}
	},
	
	/**
	 * Initializer. Executed once at the first time @items@ invoked.
	 * 
	 * @alias jQuery.Chain.services.items.init
	 * 
	 * @see jQuery.Chain.service
	 */ 
	init: function()
	{
		this.isActive = false;
		this.pushBuffer = [];
		this.shiftBuffer = [];
		this.collections = $.extend({}, this.collections);
	},
	
	/**
	 * Default handler.
	 * 
	 * @alias jQuery.Chain.services.items.handler
	 * 
	 * @param {Object} obj Object to be handled
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.service
	 * @see jQuery.Chain.services.items.handleObject
	 * @see jQuery.Chain.services.items.handleElement
	 * @see jQuery.Chain.services.items.handleArray
	 * @see jQuery.Chain.services.items.handleNumber
	 * @see jQuery.Chain.services.items.handleTrue
	 * @see jQuery.Chain.services.items.handleDefault
	 */ 
	handler: function(obj)
	{
		// Array
		if(obj instanceof Array)
			{return this.handleArray(obj);}
		// Inactive
		else if(!this.isActive)
			{return $().eq(-1);}
		// jQuery Object
		else if($.Chain.jobject(obj))
			{return this.handleElement(obj);}
		// Normal Object
		else if(typeof obj == 'object')
			{return this.handleObject(obj);}
		// Number
		else if(typeof obj == 'number')
			{return this.handleNumber(obj);}
		// True
		else if(obj === true)
			{return this.handleTrue();}
		// Default
		else
			{return this.handleDefault();}
	},
	
	/**
	 * If a Data Object is given, it will return the item element
	 * containing the object if it exists, otherwise empty.
	 * 
	 * @alias items(object)
	 * @alias jQuery.Chain.services.items.handleObject
	 * 
	 * @param {Object} obj Data Object
	 * 
	 * @return {Object} jQuery Object
	 */ 
	handleObject: function(obj)
	{
		// Get Element By Data
		return this.collection('all').filter(function(){return $(this).item() == obj;});
	},
	
	/**
	 * If a jQuery Element is given, it will return itself if it is part of the items,
	 * otherwise empty jQuery object.
	 * 
	 * @alias items(element)
	 * @alias jQuery.Chain.services.items.handleElement
	 * 
	 * @param {Object} obj jQuery Object
	 * 
	 * @return {Object} jQuery Object
	 */ 
	handleElement: function(obj)
	{
		// Check element whether it is part of items or not.
		if(!$.Chain.jidentic(obj, obj.item('root')) && $.Chain.jidentic(this.element, obj.item('root')))
			{return obj;}
		else
			{return $().eq(-1);}
	},
	
	/**
	 * If array is given, it will merge it to current items
	 * 
	 * @alias items(array)
	 * @alias jQuery.Chain.services.items.handleArray
	 * 
	 * @param {Array} array Array of Data
	 * 
	 * @return {Object} jQuery Object
	 */ 
	handleArray: function(array)
	{
		// Array will be merged in
		return this.$merge(array);
	},
	
	/**
	 * If number is given, it will get the object with the current number. Use -1 to get the last number.
	 * 
	 * @alias items(number)
	 * @alias jQuery.Chain.services.items.handleNumber
	 * 
	 * @param {Number} number Index
	 * 
	 * @return {Object} jQuery Object
	 */ 
	handleNumber: function(number)
	{
		// if -1, it will get the last.
		if(number == -1)
			{return this.collection('visible').filter(':last');}
		else
			{return this.collection('visible').eq(number);}
	},
	
	/**
	 * If @true@ is given, it will get all items including the hidden one.
	 * 
	 * @alias items(true)
	 * @alias jQuery.Chain.services.items.handleTrue
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.services.items.collections.all
	 */ 
	handleTrue: function()
	{
		return this.collection('all');
	},
	
	/**
	 * If nothing is given, it will get all visible items.
	 * 
	 * @alias items(true)
	 * @alias jQuery.Chain.services.items.handleTrue
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.services.items.collections.visible
	 */ 
	handleDefault: function()
	{
		return this.collection('visible');
	},
	
	/**
	 * Update element
	 * 
	 * @alias jQuery.Chain.services.items.update
	 */ 
	update: function()
	{
		this.element.update();
	},
	
	/**
	 * Clear all items
	 * 
	 * @alias jQuery.Chain.services.items.empty
	 */ 
	empty: function()
	{
		var all = this.collection('all');
		
		// Remove items
		// Make it run in the background. for responsiveness.
		setTimeout(function(){all.each(function(){$(this).item('remove', true);});}, 1);
		
		// Empty anchor container
		this.element.chain('anchor').empty();
	},
	
	/**
	 * Get collection of items. Define a collection by adding a function argument
	 * 
	 * @alias jQuery.Chain.services.items.collection
	 * 
	 * @param {String} col Collection name
	 * @param {Function} fn Create a collection function
	 * 
	 * @return {Object} jQuery Object
	 */ 
	collection: function(col, fn)
	{
		if(arguments.length > 1)
		{
			if(typeof fn == 'function')
				{this.collections[col] = fn;}
			
			return this.element;
		}
		else
		{
			if(this.collections[col])
				{return this.collections[col].apply(this);}
			else
				{return $().eq(-1);}
		}
		
	},
	
	/**
	 * Items Updater, called by @$(element).update()@
	 * 
	 * @alias items('update')
	 * @alias jQuery.Chain.services.items.$update
	 * 
	 * @return {Object} jQuery Element
	 */ 
	$update: function()
	{
		if(!this.element.chain('active') || !this.isActive)
			{return this.element;}
		
		var self = this;
		var builder = this.element.chain('builder');
		var template = this.element.chain('template');
		var push;
		
		var iterator = function(){
			var clone = template
				.clone()[push ? 'appendTo' :'prependTo'](self.element.chain('anchor'))
				.addClass('chain-item')
				.item('root', self.element);
			
			if(self.linkElement && $.Chain.jobject(this) && this.item())
				{clone.item('link', this, 'self');}
			else
				{clone.item(this);}
			
			clone.chain(builder, true);
		};
		
		push = false;
		$.each(this.shiftBuffer, iterator);
		push = true;
		$.each(this.pushBuffer, iterator);
		
		
		this.shiftBuffer = [];
		this.pushBuffer = [];
		
		return this.element;
	},
	
	/**
	 * Add item(s). use @items('add', 'shift', item)@ to add item at the top
	 * 
	 * @alias items('add')
	 * @alias jQuery.Chain.services.items.$add
	 * 
	 * @param {Object} item
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$add: function()
	{
		if(this.linkElement)
			{return this.element;}
		
		var cmd;
		var args = Array.prototype.slice.call(arguments);
		// Extract command
		if(typeof args[0] == 'string')
			{cmd = args.shift();}
		
		var buffer = (cmd == 'shift') ? 'shiftBuffer' : 'pushBuffer';
		
		this.isActive = true;
		this[buffer] = this[buffer].concat(args);
		this.update();
		
		return this.element;
	},
	
	/**
	 * Merge items with array of item data
	 * 
	 * @alias items('merge')
	 * @alias jQuery.Chain.services.items.$merge
	 * 
	 * @param {String} cmd Switch for push/shift
	 * @param {Array} items Item Data
	 * 
	 * @return {Object} jQuery Element
	 */ 
	$merge: function(cmd, items)
	{
		if(this.linkElement)
			{return this.element;}
		
		if(typeof cmd != 'string')
			{items = cmd;}
		var buffer = (cmd == 'shift') ? 'shiftBuffer' : 'pushBuffer';
		
		this.isActive = true;
		if($.Chain.jobject(items))
			{this[buffer] = this[buffer].concat(items.map(function(){return $(this);}).get());}
		else if(items instanceof Array)
			{this[buffer] = this[buffer].concat(items);}
		this.update();
		
		return this.element;
	},
	
	/**
	 * Replace items with new items array
	 * 
	 * @alias items('replace')
	 * @alias jQuery.Chain.services.items.$replace
	 * 
	 * @param {String} cmd Switch for push/shift
	 * @param {Array} items Item Data
	 * 
	 * @return {Object} jQuery Element
	 */ 
	$replace: function(cmd, items)
	{
		if(this.linkElement && arguments.callee.caller != this.linkUpdater)
			{return this.element;}
		
		if(typeof cmd != 'string')
			{items = cmd;}
		var buffer = (cmd == 'shift') ? 'shiftBuffer' : 'pushBuffer';
		
		this.isActive = true;
		this.empty();
		
		if($.Chain.jobject(items))
			{this[buffer] = items.map(function(){return $(this);}).get();}
		else if(items instanceof Array)
			{this[buffer] = items;}
		
		this.update();
		
		return this.element;
	},
	
	/**
	 * Remove item
	 * 
	 * @alias items('remove')
	 * @alias jQuery.Chain.services.items.$remove
	 * 
	 * @param {Object, Number} item
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$remove: function()
	{
		if(this.linkElement)
			{return this.element;}
		
		for(var i=0; i<arguments.length; i++)
			{this.handler(arguments[i]).item('remove', true);}
		this.update();
		
		return this.element;
	},
	
	/**
	 * Reorder Item
	 * 
	 * @alias items('reorder')
	 * @alias jQuery.Chain.services.items.$reorder
	 * 
	 * @param {Object} item1 Item 1
	 * @param {Object} item2 Item 2
	 * 
	 * @return {Object} jQuery object
	 */ 
	$reorder: function(item1, item2)
	{
		if(item2)
			{this.handler(item1).before(this.handler(item2));}
		else
			{this.handler(item1).appendTo(this.element.chain('anchor'));}
		this.update();
		
		return this.element;
	},
	
	/**
	 * Clear all items
	 * 
	 * @alias items('empty')
	 * @alias jQuery.Chain.services.items.$empty
	 * 
	 * @return {Object} jQuery object
	 */ 
	$empty: function()
	{
		if(this.linkElement)
			{return this.element;}
		
		this.empty();
		this.shiftBuffer = [];
		this.pushBuffer = [];
		this.update();
		
		return this.element;
	},
	
	/**
	 * Like @items()@ but returns array of data instead of the jQuery object.
	 * 
	 * @alias items('data')
	 * @alias jQuery.Chain.services.items.$data
	 * 
	 * @return {Array} list of data
	 */ 
	$data: function(x)
	{
		return this.handler(x).map(function(){return $(this).item();}).get();
	},
	
	/**
	 * Bind Items to other (chained) element. If one of them is updated,
	 * the linked element will be updated.
	 * 
	 * @alias items('link')
	 * @alias jQuery.Chain.services.items.$link
	 * 
	 * @param {Object} element element/selector to be linked with
	 * @param {String} collection Collection to be linked with (has to be @"self"@ if linked to item)
	 * 
	 * @return {Object} jQuery Element
	 * 
	 * @see jQuery.Chain.services.items.collection
	 */ 
	$link: function(element, collection)
	{
		// Remove linked element if it already exist
		if(this.linkElement)
		{
			this.linkElement.unbind('update', this.linkUpdater);
			this.linkElement = null;
		}
		
		element = $(element);
		// If element exists
		if(element.length)
		{
			var self = this;
			this.linkElement = element;
			// Create Collector Function
			this.linkFunction = function()
			{
				if(typeof collection == 'function')
				{
					try{
						return collection.call(self.element, self.linkElement);
					}catch(e){
						return $().eq(-1);
					}
				}
				else if(typeof collection == 'string')
				{
					return self.linkElement.items('collection', collection);
				}
				else
				{
					return $().eq(-1);
				}
			};
			
			// Create Updater Function
			this.linkUpdater = function()
			{
				self.$replace(self.linkFunction());
			};
			
			// Bind updater to linked element
			this.linkElement.bind('update', this.linkUpdater);
			this.linkUpdater();
		}
		
		return this.element;
	},
	
	/**
	 * Get index of an Item
	 * 
	 * @alias items('index')
	 * @alias jQuery.Chain.services.items.$index
	 * 
	 * @param {Object} item
	 * 
	 * @return {Number} index
	 */ 
	$index: function(item)
	{
		return this.collection('all').index(this.handler(item));
	},
	
	/**
	 * Get collection of items. Define a collection by adding a function argument
	 * 
	 * @alias items('collection')
	 * @alias jQuery.Chain.services.items.$collection
	 * 
	 * @param {String} col Collection name
	 * @param {Function} fn Create a collection function
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$collection: function()
	{
		return this.collection.apply(this, Array.prototype.slice.call(arguments));
	},
	
	/**
	 * Check Status of @items@
	 * 
	 * @alias items('active')
	 * @alias jQuery.Chain.services.items.$active
	 * 
	 * @return {Boolean} Status
	 */ 
	$active: function()
	{
		return this.isActive;
	},
	
	/**
	 * Backup Item to the state before being built.
	 * 
	 * @alias items('backup')
	 * @alias jQuery.Chain.services.items.$backup
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$backup: function()
	{
		if(!this.element.chain('active') || !this.isActive)
			{return this.element;}
		
		var buffer = [];
		this.collection('all').each(function(){
			var item = $(this).item();
			if(item)
				{buffer.push(item);}
		});
		
		this.pushBuffer = buffer.concat(this.pushBuffer);
		
		this.empty();
		
		return this.element;
	},
	
	/**
	 * Destroy items service.
	 * 
	 * @alias items('destroy')
	 * @alias jQuery.Chain.services.items.$destroy
	 * 
	 * @return {Object} jQuery Element
	 */ 
	$destroy: function()
	{
		this.empty();
		return this.element;
	}
});

// Filtering extension
$.Chain.extend('items', {
	/**
	 * Filtering subroutine
	 * 
	 * @alias jQuery.Chain.services.items.doFilter
	 */ 
	doFilter: function()
	{
		var props = this.searchProperties;
		var text = this.searchText;
		
		if(text)
		{
			// Make text lowerCase if it is a string
			if(typeof text == 'string')
				{text = text.toLowerCase();}
			
			// Filter items
			var items = this.element.items(true).filter(function(){
				var data = $(this).item();
				// If search properties is defined, search for text in those properties
				if(props)
				{
					for(var i=0; i<props.length; i++)
					{
						if(typeof data[props[i]] == 'string'
							&& !!(typeof text == 'string' ? data[props[i]].toLowerCase() : data[props[i]]).match(text))
							{return true;}
					}
				}
				// Otherwise search in all properties
				else
				{
					for(var prop in data)
					{
						if(typeof data[prop] == 'string'
							&& !!(typeof text == 'string' ? data[prop].toLowerCase() : data[prop]).match(text))
							{return true;}
					}
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
	
	/**
	 * Filter items by criteria. Filtered items will be hidden.
	 * 
	 * @alias items('filter')
	 * @alias jQuery.Chain.services.items.$filter
	 * 
	 * @param {String, RegExp} text Search keyword
	 * @param {String, Array} properties Search properties
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$filter: function(text, properties)
	{
		// If no argument, just refilter
		if(!arguments.length)
			{return this.update();}
		
		this.searchText = text;
		
		if(typeof properties == 'string')
			{this.searchProperties = [properties];}
		else if(properties instanceof Array)
			{this.searchProperties = properties;}
		else
			{this.searchProperties = null;}
		
		// Bind to preupdate
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
	/**
	 * Sorting subroutine
	 * 
	 * @alias jQuery.Chain.services.items.doSort
	 */ 
	doSort: function()
	{
		var name = this.sortName;
		var opt = this.sortOpt;
		
		var sorter = 
		{
			'number': function(a, b){
				return parseFloat(($(a).item()[name]+'').match(/\d+/gi)[0])
					- parseFloat(($(b).item()[name]+'').match(/\d+/gi)[0]);
			},
		
			'default': function(a, b){
				return $(a).item()[name] > $(b).item()[name] ? 1 : -1;
			}
		};
		
		if(name)
		{
			var sortfn = opt.fn || sorter[opt.type] || sorter['default'];
				
			var array = this.element.items(true).get().sort(sortfn);
			
			array = opt.desc ? array.reverse() : array;
			
			for(var i=0; i<array.length; i++)
				{this.element.chain('anchor').append(array[i]);}
			
			opt.desc = opt.toggle ? !opt.desc : opt.desc;
		}
		else
		{
			this.element.unbind('preupdate', this.sortBinding);
			this.sortBinding = null;
		}
	},
	
	/**
	 * Sort items by property.
	 * 
	 * @alias items('sort')
	 * @alias jQuery.Chain.services.items.$sort
	 * 
	 * @param {String} name sorting property
	 * @param {Object} opt {toggle:true/false, desc:true/false, type:'number/default'}
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$sort: function(name, opt)
	{
		if(!name && name !== null && name !== false)
			{return this.update();}
		
		if(this.sortName != name)
			{this.sortOpt = $.extend({desc:false, type:'default', toggle:false}, opt);}
		else
			{$.extend(this.sortOpt, opt);}
		
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