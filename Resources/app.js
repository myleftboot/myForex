// All source code Copyright 2013 Cope Consultancy Services. All rights reserved

var currencyListWindow = Ti.UI.createWindow({title: 'Currencies'});

function fetchValues(_args) {
	// returns a list of prices from an array of stocks
	
	if (_args.pairings.length > 0) {
		var currencies = new String;
		for (i=0; i< _args.pairings.length; i++) {
			currencies += ',"'+_args.pairings[i]+'"';
		}
		// lose the first character ','
		currencies = currencies.substr(1);
		
		var theYql = 'SELECT * from yahoo.finance.xchange WHERE pair IN (' + currencies + ')';

		// send the query off to yahoo
		Ti.Yahoo.yql(theYql, function(e) {
			populateTable({JSON: e.data});
		});
	}
};

function populateTable(_args) {
	var tabRows = [];
	// we need to make single objects returned into an array
	try { var rates = (_args.JSON.rate instanceof Array) ? _args.JSON.rate : [_args.JSON.rate];
	} catch (e) {
		return;
	}
	for (var i in rates) {
		var tableRow = Ti.UI.createTableViewRow({
			height: 70,
			className: 'RSSRow',
			hasDetail: true,
		});
		var layout = Ti.UI.createView({});
		
		var pair = Ti.UI.createLabel({
			text: rates[i].Name,
			color: '#000',
			height: 70,
			font: {
				fontSize: 16
			},
			left: 20
		});

		var value = Ti.UI.createLabel({
			text:  rates[i].Rate,
			color: 'blue',
			height: 70,
			font: {
				fontSize: 16
			},
			right: 20
		});
		layout.add(pair);
		layout.add(value);
		
		// set some row context
		tableRow.pair = rates[i].Name;
		tableRow.rate = rates[i].Rate;
		
		tableRow.add(layout);
		
		tabRows.push(tableRow);
	}
	stockList.setData(tabRows);
};

function refreshCurrencies(_args) {
	
	Ti.App.fireEvent('app:analytics_trackEvent', {category:'Currency Selection', action:'Select Currency', value:_args.value});
	//flurry.logEvent('Select Currency', {key: _args.value});
	var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
	var data = db.execute('SELECT base||counter pair FROM currencies WHERE counter="'+_args.value+'";');
	
	var pairs = [];
	var i = 0;
	while (data.isValidRow()) {
		pairs[i++] = data.fieldByName('pair');
		data.next();
	}
	
	data.close();
	db.close();
	
	fetchValues({pairings: pairs});
};

function createCurrencyPicker() {
	var currencyPicker = Ti.UI.createPicker(
		{height             :'40%',
		 selectionIndicator : true});
	
	// populate the picker from the SQLite currencies
	
	// Database file already exists so we need to use install, to copy it to the internal storage
	var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
	var data = db.execute('SELECT DISTINCT counter FROM currencies;');

	var pickRow = [];
	var i = 0;
	while (data.isValidRow()) {
		pickRow[i++] = Ti.UI.createPickerRow({title:data.fieldByName('counter')});
		data.next();
	}
	
	data.close();
	db.close();
	
	currencyPicker.add(pickRow);
	return currencyPicker;
};

function showCurrencyDetail(_args) {
	var CurrencyDetail = require('forexCommentaryView');
	var currencyDetail = new CurrencyDetail();
	
	currencyDetail.fireEvent('currencySelected', {
			pair:_args.rowData.pair,
			rate:_args.rowData.rate
		});
	
	navGroup.open(currencyDetail);
	// get the custom object for this pair from ACS
	
	// display the currency value, 
	
	// store a timestamp of the current value key value pairs?
	
	// Add any commentary, and valid flag
	
};

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create base root window
//

var win1 = Ti.UI.createWindow({  
    backgroundColor:'#fff'
});

var vertLayout = Ti.UI.createView({layout:'vertical'});

var stockList = Ti.UI.createTableView({});
stockList.addEventListener('click', function(e) {showCurrencyDetail(e)});

var picker = createCurrencyPicker();

//the selectedValue property returns an array. We are only interested in a single selected value so grabthe first element [0]
picker.addEventListener('change', function(e) {refreshCurrencies({value: e.selectedValue[0]})
						});

vertLayout.add(picker);
vertLayout.add(stockList);

currencyListWindow.add(vertLayout);

var navGroup = Ti.UI.iPhone.createNavigationGroup({
	window:currencyListWindow
});
win1.add(navGroup);

Ti.include('analytics.js');
var analytics = new Analytics('UA-36649942-1');  
analytics.reset();

Ti.App.addEventListener('app:analytics_trackPageview', function(e){
	analytics.trackPageview('/' + e.pageUrl);
});

Ti.App.addEventListener('app:analytics_trackEvent', function(e){
	console.log('Caught event '+e.action);
	analytics.trackEvent(e.category, e.action, e.label, e.value);
});


analytics.start(5);
Ti.App.fireEvent('app:analytics_trackPageview', {pageUrl: 'Front'});

win1.open();

picker.setSelectedRow(0,0);

Ti.Network.registerForPushNotifications({
  types: [
    Ti.Network.NOTIFICATION_TYPE_BADGE,
    Ti.Network.NOTIFICATION_TYPE_ALERT,
    Ti.Network.NOTIFICATION_TYPE_SOUND
  ],
  success:function(e){
    var UrbanAirship = require('urbanairship');
    UrbanAirship.register({token   : e.deviceToken,
                           key     : 'TqaKBprXTLC94fpBKJtFsQ',
                           secret  : 'sV8wM0CaR0O2qjFpw4Q2Qg', 
                           params  : {alias: 'The new user'},
                           success : function(e) {alert(e.response)},
                           error   : function(e) {alert(e.error)}
    });
  },
  error:function(e) {
    alert('Failed to register with APNS '+e.error);
  },
  callback:function(e) {
    var a = Ti.UI.createAlertDialog({
      title:'myForex',
      message:e.data.alert
    });
    a.show();
  }
});
