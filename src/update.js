(function($){

$.Chain.service('update', {
	handler: function(opt)
	{
		if(typeof opt == 'function')
			return this.bind(opt);
		else
			return this.trigger(opt);
	},
	
	bind: function(fn)
	{
		return this.element.bind('update', fn);
	},
	
	trigger: function(opt)
	{
		this.element.items('update');
		this.element.item('update');
		
		this.element.triggerHandler('preupdate', this.element.item());
		
		if(opt == 'hard')
			this.element.items(true).each(function(){$(this).update();});
		
		this.element.triggerHandler('update', this.element.item());
		
		return this.element;
	}
});
	
})(jQuery);