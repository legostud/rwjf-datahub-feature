
(function($) {
     
	 // Returns dashboard specific vars as JSON. The 'vars' portion can be any text.
	 var configUrl = '/en/vars.dashboard.config.json';
	
	
	 $(function () {
		
		var dataManager = new DataManager(configUrl).init();
		
		 $(document).on('click', '.dc-structure-selection-featurecard .step-1 .select-a', function(ev) {
		 
			  var $step = $(ev.currentTarget).closest('.step');
			  
			  $('.dc-structure-selection-featurecard').addClass('open');
			  
			  $('.dc-structure-selection-featurecard .step').removeClass('active-step');
			  
			  $step.addClass('active-step');

			  $('.step-2 .payload-wrapper').hide();
			  $('.step-3 .payload-wrapper').hide();
			  $('.step-3 .view-report-wrapper').hide();

		 });
		 
		 $(document).on('click', '.step-1 .payload .selection-item', { dataManager: dataManager }, function(ev) {
		 
			  var $category = $(ev.currentTarget),
				  model = $category.data('model');
			  
			  ev.preventDefault();
			  
			  // Reset active
			  $('.step-1 .payload .selection-item').removeClass('active');
			  
			  $category.addClass('active');
			  
			  ev.data.dataManager.renderIndicator($('.step-2 .payload'), model.Indicators);
			  
			  $('.step-2 .payload-wrapper').show();
			  $('.step-3 .payload-wrapper').hide();
			  $('.step-3 .view-report-wrapper').hide();

			  $('.dc-structure-selection-featurecard .step').removeClass('active-step');
			  
			  $('.dc-structure-selection-featurecard .step-2').addClass('active-step');	
			  
			  dataManager.handleChange();
			  
		 });
		 
		 $(document).on('click', '.step-2 .payload .selection-item', { dataManager: dataManager }, function(ev) {
		 
			  var $indicator = $(ev.currentTarget),
				  model = $indicator.data('model');
			  
			  ev.preventDefault();
			  
			  // Reset active
			  $('.step-2 .payload .selection-item').removeClass('active');
			  
			  $indicator.addClass('active');

			  $('.dc-structure-selection-featurecard .step').removeClass('active-step');
			  
			  $('.dc-structure-selection-featurecard .step-3').addClass('active-step');			  
			  
			  dataManager.handleChange();

			  $('.step-2 .payload-wrapper').show();
			  $('.step-3 .payload-wrapper').show();
			  $('.step-3 .view-report-wrapper').show();
			  
		 });
		 
		 $(document).on('click', '.dc-structure-selection-featurecard .cancel', { dataManager: dataManager }, function(ev) {
		 
			  $('.dc-structure-selection-featurecard').removeClass('open');
			  
			  $('.dc-structure-selection-featurecard .step').removeClass('active-step');
			  
			  $('.dc-structure-selection-featurecard .step-1').addClass('active-step');				  
			  
			  dataManager.handleChange();			  
			  
		 });
		 
		 
		 $(document).on('click', '.dc-structure-selection-featurecard .view-report a', { dataManager: dataManager }, function(ev) {
		 
			  ev.preventDefault();
			  
			  dataManager.handleViewReportClick();
			  
		 });
		 
		 
		 $(document).on('change', '.dc-structure-selection-featurecard .step-3 select', { dataManager: dataManager }, function(ev) {
			  
			  $('.dc-structure-selection-featurecard .step').removeClass('active-step');
			  
			  $('.dc-structure-selection-featurecard .step-3').addClass('active-step');	
			  
		 });		 
 
		 
		 
		
	 });
 
	 function DataManager(configurl) {
	 
		this.configurl = configurl;
		
		return this;
	 };
	 
	 // Grab config variables via ajax call
	 DataManager.prototype.init = function(callback) {
	 
		 var self = this;
 
		 if (this.configurl === undefined) return;

         $.ajax({
             type: 'GET',
             dataType: 'json',
             url: this.configurl
         })
		 
         // Now make a request for the categories, now we have the Datacenter API url
         .done(function (resp) {

			self.apiUrl = resp.dashboardUrl + '/api';
			
			self.datahubUrl = resp.datahubNationalUrl;
			
			self.getData();
			
         });	 
	 
		return this;
	 };
	 
	 
	 // Grab data
	 DataManager.prototype.getData = function() {
	 
			var self = this;
			
			if (!this.apiUrl || !this.datahubUrl) return;
			
			$.when( 
			
				$.ajax({
					 dataType: "jsonp",
					 url: this.apiUrl + '/categories/'
				 }),
				 
				$.ajax({
					 dataType: "jsonp",
					 url: this.apiUrl + '/locations/'
				 })

 
			).done(function(categories, locations) {
 
				self.categories = categories[0];
				
				self.locations = locations[0];
				
				$('.lbl-loading').remove();
				
				$('.dc-structure-selection-featurecard').removeClass('loading');
				
				self.render($('.step-1 .payload'), self.categories);
				
				// self.render($('.step-2 .payload'), self.categories[0].Indicators);
 
				// $('.step-1 .payload li').first().addClass('active');
				
				// $('.step-2 .payload li').first().addClass('active');
				
				self.renderLocations(self.locations);

				// $('.dc-structure-selection-featurecard').addClass('enabled');
				
				self.$categories = $('.step-1 .payload');
				
				self.$indicators = $('.step-2 .payload');
				
				self.$locations = $('.step-3 .payload select');
				
			});
	 
	 };
	 
	 DataManager.prototype.render = function($step, models) {
	 
		var self = this;
		
		// Reset
		$step.empty();
		
		// Main DOM elements
		
		// Render Categories
		$.each( models, function( index, model ) {
		
			var lbl = model.ShortName ? model.ShortName : model.Name;
			
			$('<li/>')
				.addClass('selection-item')
				.addClass(index === 0 ? 'dc-first' : '')
				.data('model', model)
				.html('<span class="icon">&nbsp;</span><a href="#" class="selection-link">' + lbl + '</a>')
				.appendTo($step);
			
		});
	 };

	 DataManager.prototype.renderIndicator = function($step, models) {
		var self = this;

		// Reset
		$step.empty();
		
		// Main DOM elements
		
		// Render Categories
		$.each( models, function( index, model ) {
			var distributions = self.parseDistributions(model);
			var lbl = model.ShortName ? model.ShortName : model.Name;
			
			$('<li/>')
				.addClass('selection-item')
				.addClass(index === 0 ? 'dc-first' : '')
				.data('model', model)
				.html('<span class="icon">&nbsp;</span><a href="#" class="selection-link">' + lbl + '</a>')
				.appendTo($step);
			
		});
	 };
	 
	 DataManager.prototype.renderLocations = function(models) {
	 
		var $locations = $('.step-3 .payload'),
			$select = $('<select/>'),
			$li = $('<li/>'),
			nationalAverage = models.pop();
		
		// Save a reference
		this.nationalAverage = nationalAverage;
		
		// Adjust label
		nationalAverage.Name = 'National Average';
		
		// Move National Item to front
		models.unshift(nationalAverage);
			
		// Render Categories
		$.each( models, function( index, loc ) {
		
			var $option = $('<option/>')
							.addClass(index === 0 ? 'national' : '')
							.html(loc.Name)
							.attr('value', loc.Id)
							.appendTo($select);
		
		});
		
		$select.appendTo($li);
		
		$li.appendTo($locations);
	 
	 };
	 
	 DataManager.prototype.handleChange = function() {

		// Determines the opacity level of view report btn
		if( $('.step-2 .payload .active').length === 0 ) {
			$('.dc-structure-selection-featurecard').removeClass('enabled');
		} else {
			$('.dc-structure-selection-featurecard').addClass('enabled');
		}
		
		// Reset warning message
		$('.view-report-msg').hide();
		
	 };
	 
	 DataManager.prototype.handleViewReportClick = function() {
	 
		var ids,
			$msg = $('.view-report-msg');
		
		// Show warning if no indicator selected
		if($('.step-2 .payload .active').length === 1 ){
			$msg.hide();
		} else {
			$msg.show();
		}
		
		if ($('.dc-structure-selection-featurecard').hasClass('enabled')) {
		
			ids = this.getIds();
			
			window.location = this.getLink(ids);
			
		}
	 };
	 
	 DataManager.prototype.getIds = function() {
	 
		var category = this.$categories.find('.active').data('model'),
			indicator = this.$indicators.find('.active').data('model'),
			$location = this.$locations.find(':selected'),
			locid;
		
		locid = $location.hasClass('national') ? undefined : parseInt($location.attr('value'));
		
		return { category: category.Id, indicator: indicator.Id, location: locid }
	 };
	 
	 DataManager.prototype.getLink = function(ids) {
	 
		var link;

		if (!ids.indicator || !this.datahubUrl) return;
		
		link = this.datahubUrl + '#q/scope/'
		
		link += ids.location ? 'state' : 'national';
		
		link += '/ind/' + ids.indicator;
		
		link += '/viz/best';
		
		if (ids.location) {
		
			link += '/fstate/' + ids.location;
			
			link += '/locs/' + ids.location + ',' + this.nationalAverage.Id;
			
		}
		
		return link;
	 };
	 
	 DataManager.prototype.parseDistributions = function(model) {
		var distributions,
			characteristics,
			temp;
		
		// Are there any distributions
		if (model.Distributions.length) {
			distributions = model.Distributions;
		} else {
			return false;
		}
		
		// Is this a double-distribution?
		if (distributions && distributions[0].IsDoubleDistribution) {
			// Get the first characteristic
			if (distributions[0].Characteristics.length) {
				characteristics = distributions[0].Characteristics[0];
			} else {
				return false;
			}

			// Update the response to point to the nested distributions instead of the master distribution
			if (characteristics && characteristics.Distributions.length) {
				distributions = characteristics.Distributions;
			} else {
				return false;
			}
		}
		
		return distributions;
	};
	 
}(jQuery))

