// All source code Copyright 2013 Cope Consultancy Services. All rights reserved


// Main Namespace
var Forex = {navGroup: null // the navigation group
	};

var currencyListWindow = Ti.UI.createWindow({title: 'Currencies'});


function fetchValues(_args) {
	// returns a list of prices from an array of stocks

	if (_args.pairings.length > 0) {
		var currencies = new String;
		for (i=0; i< _args.pairings.length; i++) {
			currencies += ',"'+_args.pairings[i].pair+'"';
		}
		// lose the first character ','
		currencies = currencies.substr(1);
		var theYql = 'SELECT * from yahoo.finance.xchange WHERE pair IN (' + currencies + ')';

		// send the query off to yahoo
		Ti.Yahoo.yql(theYql, function(e) {
			updateCurrencies({JSON: e.data});
		});
	}
};

function updateCurrencies(_args) {
	var tabRows = [];
	// we need to make single objects returned into an array
	try { var rates = (_args.JSON.rate instanceof Array) ? _args.JSON.rate : [_args.JSON.rate];
	} catch (e) {
		return;
	}
	var db = require('common/currencydb');
	for (var i in rates) {
		
		db.updateRate({pair   : rates[i].Name
		              ,rate   : rates[i].Rate});
	}
	stockList.setData(populateTableWithPairs());
};

function createRow(_args) {
                var tableRow = Ti.UI.createTableViewRow({
			height: 50,
			className: 'RSSRow',
			hasDetail: true,
		});
		var layout = Ti.UI.createView({});

		var pair = Ti.UI.createLabel({
			text: _args.pair,
			color: '#000',
			height: 50,
			font: {
				fontSize: 16
			},
			left: 20
		});

		var value = Ti.UI.createLabel({
			text:  _args.rate,
			color: 'blue',
			height: 50,
			font: {
				fontSize: 16
			},
			right: 20
		});
		layout.add(pair);
		layout.add(value);

		// set some row context
		tableRow.pair = _args.pair;
		tableRow.rate = _args.rate;

		tableRow.add(layout);
		
		return tableRow;
}

function populateTableWithPairs() {
	var tabRows = [];
	
	var db = require('common/currencydb');
	var pairs = db.selectPairs()
	for (var dbVal in pairs) {

                // we dont know the currency values at this stage so just push the pairings
                // we should store the latest values in the local database and populate the table with them here

		tabRows.push(createRow({pair: pairs[dbVal].pair
		                       ,rate: pairs[dbVal].lastRate}));
	}
	return tabRows;
}

function refreshCurrencies(_args) {
	
	var db = require('common/currencydb');
	fetchValues({pairings: db.selectPairs()});
};


function showCurrencyDetail(_args) {
	var CurrencyDetail = require('forexCommentaryView');
	var currencyDetail = new CurrencyDetail();

	currencyDetail.fireEvent('currencySelected', {
			pair:_args.rowData.pair,
			rate:_args.rowData.rate
		});

	Forex.navGroup.open(currencyDetail);

};

function showPinBar(_args) {
                var PBVw = require('view/pinbarentry');
		var pbVw = new PBVw();

		pbVw.fireEvent('popPinBar', {
			pair:_args.rowData.pair,
			risk:1,
			rate:_args.rowData.rate
		});

		Forex.navGroup.open(pbVw);

};

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create base root window
//

var win1 = Ti.UI.createWindow({  
    backgroundColor:'#fff'
});

var vertLayout = Ti.UI.createView({layout:'vertical'});

var stockList = Ti.UI.createTableView({data: populateTableWithPairs()});

stockList.addEventListener('click', function(e) {showCurrencyDetail(e)});
stockList.addEventListener('click', function(e) {showPinBar(e)});

vertLayout.add(stockList);

currencyListWindow.add(vertLayout);

Forex.navGroup = Ti.UI.iPhone.createNavigationGroup({
	window:currencyListWindow
});
win1.add(Forex.navGroup);

Ti.include('analytics.js');
var analytics = new Analytics('UA-37362038-1');  
analytics.reset();

Ti.App.addEventListener('app:analytics_trackPageview', function(e){
	analytics.trackPageview('/' + e.pageUrl);
});

Ti.App.addEventListener('app:analytics_trackEvent', function(e){
	analytics.trackEvent(e.category, e.action, e.label, e.value);
});


analytics.start(5);
Ti.App.fireEvent('app:analytics_trackPageview', {pageUrl: 'Front'});

var r = require('common/windowButtons');
var rightButton = r.rightNavButton({click: refreshCurrencies});
win1.rightNavButton = rightButton;
	
win1.open();
refreshCurrencies();
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
