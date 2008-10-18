/**
 * Chain Update Service
 * 
 * @alias update
 * 
 * @syntax $(selector).update(parameters);
 */ 

(function($){

/**
 * Chain Update Service Object - Providing methods of @update@.
 * All method listed here can only be used internally
 * using @jQuery.Chain.service@ or @jQuery.Chain.extend@
 * 
 * @namespace
 * 
 * @alias jQuery.Chain.services.update
 * 
 * @see jQuery.Chain.service
 * @see jQuery.Chain.extend
 */ 

$.Chain.service('update', {
	/**
	 * Default Handler
	 * 
	 * @alias jQuery.Chain.services.update.handler
	 * 
	 * @see jQuery.Chain.service
	 * @see jQuery.Chain.services.update.bind
	 * @see jQuery.Chain.services.update.trigger
	 */ 
	handler: function(opt)
	{
		if(typeof opt == 'function')
			{return this.bind(opt);}
		else
			{return this.trigger(opt);}
	},
	
	/**
	 * If you pass a function to update, it will bind it to the update event.
	 * just like jQuerys @click()@ or @mouseover()@.
	 * 
	 * @alias update(fn)
	 * @alias jQuery.Chain.services.update.bind
	 * 
	 * @param {Function} fn Listener
	 * 
	 * @example
	 * // assuming #person is already chained
	 * $('#person').update(function{
	 * 		alert($(this).item().name);
	 * });
	 * 
	 * $('#person').item({name: 'Rizqi'})
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.services.update.handler
	 */ 
	bind: function(fn)
	{
		return this.element.bind('update', fn);
	},
	
	/**
	 * If no argument or "hard" is passed,
	 * it will update the element and trigger the update event.
	 * 
	 * @alias update(opt)
	 * @alias jQuery.Chain.services.update.trigger
	 * 
	 * @param {String} opt If 'hard', it will update each of items
	 * 
	 * @example
	 * $('#person').update();
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.services.update.handler
	 */ 
	trigger: function(opt)
	{
		this.element.items('update');
		this.element.item('update');
		
		this.element.triggerHandler('preupdate', this.element.item());
		
		if(opt == 'hard')
			{this.element.items(true).each(function(){$(this).update();});}
		
		this.element.triggerHandler('update', this.element.item());
		
		return this.element;
	}
});
	
})(jQuery);