// All source code Copyright 2013 Cope Consultancy Services. All rights reserved


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
	
	var rates = (_args.JSON.rate instanceof Array) ? _args.JSON.rate : [_args.JSON.rate];
	for (var i in rates) {
		var tableRow = Ti.UI.createTableViewRow({
			height: 70,
			className: 'RSSRow'
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

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create base root window
//

var win1 = Ti.UI.createWindow({  
    backgroundColor:'#fff'
});

var vertLayout = Ti.UI.createView({layout:'vertical'});


var stockList = Ti.UI.createTableView({});

var picker = createCurrencyPicker();

//the selectedValue property returns an array. We are only interested in a single selected value so grabthe first element [0]
picker.addEventListener('change', function(e) {refreshCurrencies({value: e.selectedValue[0]})
						});

vertLayout.add(picker);
vertLayout.add(stockList);

win1.add(vertLayout);

win1.open();

