/**
 * Chain Item Service.
 * Method to bind item to object.
 * 
 * @alias item
 * 
 * @syntax $(selector).item(parameters);
 */ 

(function($){

/**
 * Chain Item Manager - Providing methods of @item@.
 * All method listed here can only be used internally
 * using @jQuery.Chain.service@ or @jQuery.Chain.extend@
 * 
 * @namespace
 * 
 * @alias jQuery.Chain.services.item
 * 
 * @see jQuery.Chain.service
 * @see jQuery.Chain.extend
 */ 

$.Chain.service('item', {
	/**
	 * Initializer. Executed once at the first time @item@ invoked.
	 * 
	 * @alias jQuery.Chain.services.item.init
	 * 
	 * @see jQuery.Chain.service
	 */ 
	init: function()
	{
		this.isActive = false;
		this.isBuilt = false;
		this.root = this.element;
		this.data = false;
		this.datafn = this.dataHandler;
	},
	
	/**
	 * Default handler.
	 * 
	 * @alias jQuery.Chain.services.item.handler
	 * 
	 * @param {Object} obj Object to be handled
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.service
	 * @see jQuery.Chain.services.item.handleObject
	 * @see jQuery.Chain.services.item.handleFunction
	 * @see jQuery.Chain.services.item.handleDefault
	 */ 
	handler: function(obj)
	{
		if(typeof obj == 'object')
			{return this.handleObject(obj);}
		else if(typeof obj == 'function')
			{return this.handleFunction(obj);}
		else
			{return this.handleDefault();}
	},
	
	/**
	 * Edit/Bind Item.
	 * If no Object defined, it will bind the object to the Item, otherwise
	 * it will alter the object using the provided object.
	 * 
	 * @alias item(object)
	 * @alias jQuery.Chain.services.item.handleObject
	 * 
	 * @param {Object} obj Object to be inserted
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @example
	 * $('#element').item({name:'Rizqi', country:'Germany'});
	 * $('#element').item({country:'Indonesia'});
	 * $('#element').item(); // Returns {name:'Rizqi', country:'Indonesia'}
	 * 
	 * @see jQuery.Chain.services.item.handler
	 */ 
	handleObject: function(obj)
	{
		this.setData(obj);
		this.isActive = true;
		this.update();
		
		return this.element;
	},
	
	/**
	 * Add setter and getter to item.
	 * This function will change the way @item(object)@ and @item()@ works.
	 * 
	 * @alias item(fn)
	 * @alias jQuery.Chain.services.item.handleFunction
	 * 
	 * @param {Function} fn Getter&Setter Function
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @example
	 * $(element).item(function(oldval, newval){
	 * 		//setter
	 * 		if(newval)
	 * 			return $.extend(oldval, newval);
	 * 		//getter
	 *		else
	 * 			return oldval;
	 * })
	 */ 
	handleFunction: function(fn)
	{
		// datafn stores the getter/setter function
		this.datafn = fn;
		
		return this.element;
	},
	
	/**
	 * Get Data if no argument passed.
	 * 
	 * @alias item()
	 * @alias jQuery.Chain.services.item.handleDefault
	 * 
	 * @return {Object, Boolean} Returns Data Object if exist, otherwise false
	 */ 
	handleDefault: function()
	{
		if(this.isActive)
			{return this.getData();}
		else
			{return false;}
	},
	
	/**
	 * Data Getter Wrapper Function
	 * 
	 * @alias jQuery.Chain.services.item.getData
	 * 
	 * @return {Object} data
	 */ 
	getData: function()
	{
		// Call Getter
		this.data = this.datafn.call(this.element, this.data);
		
		return this.data;
	},
	
	/**
	 * Data Setter Wrapper Function
	 * 
	 * @alias jQuery.Chain.services.item.setData
	 */ 
	setData: function(obj)
	{
		var data;
		
		// Determine whether object is a jQuery object or a data object
		if($.Chain.jobject(obj) && obj.item())
			{data = $.extend({}, obj.item());}
		else if($.Chain.jobject(obj))
			{data = {};}
		else
			{data = obj;}
		
		// Call Setter
		this.data = this.datafn.call(this.element, this.data || data, data);
		
		// Handle Linked Element
		if(this.linkElement && this.linkElement[0] != obj[0])
		{
			var el = this.linkFunction();
			if($.Chain.jobject(el) && el.length && el.item())
				{el.item(this.data);}
		}
	},
	
	/**
	 * Default Getter/Setter
	 * 
	 * @alias jQuery.Chain.services.item.dataHandler
	 * 
	 * @param {Object} oldval Old value
	 * @param {Object} newval New Value
	 * 
	 * @return {Object} returns data value
	 */ 
	dataHandler: function(oldval, newval)
	{
		if(arguments.length == 2)
			{return $.extend(oldval, newval);}
		else
			{return oldval;}
	},
	
	/**
	 * Update element. Wrapper for @jQuery.Chain.services.item.element.update@
	 * 
	 * @alias jQuery.Chain.services.item.update
	 * 
	 * @return {Object} jQuery Object
	 */ 
	update: function()
	{
		return this.element.update();
	},
	
	/**
	 * Build item, apply builder and plugins
	 * 
	 * @alias jQuery.Chain.services.item.build
	 * 
	 * @see jQuery.Chain.services.item.$update
	 */ 
	build: function()
	{
		// IE Fix
		var fix = this.element.chain('template', 'raw').replace(/jQuery\d+\=\"null\"/gi, "");
		this.element.chain('anchor').html(fix);
		
		// If item has root (items)
		if(!$.Chain.jidentic(this.root, this.element))
		{
			// Get plugin from root and apply them
			var plugins = this.root.chain('plugin');
			for(var i in plugins)
			{
				plugins[i].apply(this.element, [this.root]);
			}
			
		}
		
		// Apply builder
		this.element.chain('builder').apply(this.element, [this.root]);
		this.isBuilt = true;
	},
	
	/**
	 * Item Updater, called within @$(element).update()@
	 * 
	 * @alias item('update')
	 * @alias jQuery.Chain.services.item.$update
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$update: function()
	{
		if(this.element.chain('active') && this.isActive && !this.isBuilt && this.getData())
			{this.build();}
		
		return this.element;
	},
	
	/**
	 * Replace Data with new data
	 * 
	 * @alias item('replace')
	 * @alias jQuery.Chain.services.item.$replace
	 * 
	 * @param {Object} obj Data Object
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @example
	 * $(element).item('replace', data);
	 */ 
	$replace: function(obj)
	{
		this.data = {};
		this.setData(obj);
		this.isActive = true;
		this.update();
		return this.element;
	},
	
	/**
	 * Remove Item And destroy it.
	 * 
	 * @alias item('remove')
	 * @alias jQuery.Chain.services.item.$remove
	 * 
	 * @param {Boolean} noupdate If true it won't update the root element
	 */ 
	$remove: function(noupdate)
	{
		// Destroy And Remove
		this.element.chain('destroy');
		this.element.remove();
		this.element.item('link', null);
		this.element.item('destroy');
		
		// Update root under certain circumtances
		if(!$.Chain.jidentic(this.root, this.element) && !noupdate)
			{this.root.update();}
	},
	
	/**
	 * Check Status of @item@
	 * 
	 * @alias item('active')
	 * @alias jQuery.Chain.services.item.$active
	 * 
	 * @return {Boolean} Status
	 */ 
	$active: function()
	{
		return this.isActive;
	},
	
	/**
	 * Get/Set Root element.
	 * 
	 * @alias item('root')
	 * @alias jQuery.Chain.services.item.$root
	 * 
	 * @param {Object} root New Root element
	 * 
	 * @return {Object} If a new root passed, it will be item Element. Otherwise current root.
	 */ 
	$root: function(root)
	{
		if(arguments.length)
		{
			this.root = root;
			this.update();
			return this.element;
		}
		else
		{
			return this.root;
		}
	},
	
	/**
	 * Backup Item to the state before being built.
	 * 
	 * @alias item('backup')
	 * @alias jQuery.Chain.services.item.$backup
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$backup: function()
	{
		this.isBuilt = false;
		
		return this.element;
	},
	
	/**
	 * Bind Item to other (chained) element. If one of them is updated,
	 * the linked element will be updated.
	 * 
	 * @alias item('link')
	 * @alias jQuery.Chain.services.item.$link
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
		// If there are previous linkElement
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
			// Function that get the linked item.
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
			
			// Watch linked element for update, and trigger update in self
			this.linkUpdater = function()
			{
				var res = self.linkFunction();
				if(res && res.length)
					{self.element.item(res);}
			};
			
			this.linkElement.bind('update', this.linkUpdater);
			this.linkUpdater();
		}
		
		return this.element;
	},
	
	/**
	 * Destroy item service.
	 * 
	 * @alias item('destroy')
	 * @alias jQuery.Chain.services.item.$destroy
	 * 
	 * @return {Object} jQuery Element
	 */ 
	$destroy: function()
	{
		return this.element;
	}
});

})(jQuery);