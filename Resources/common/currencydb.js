// All source code Copyright 2013 Cope Consultancy Services. All rights reserved
// Currency database operations


// need to have last rate and selected added to table

function makePair(_args) {
	return _args.replace(' to ', '');
}

function selectPairs(_args) {
    var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
	var sql = 'SELECT base||counter pair, lastrate FROM currencies';
	try {
		var data = db.execute(sql);
	} catch(e) {
		try {
			db.execute('ALTER TABLE currencies ADD COLUMN lastrate number;');
		} catch (e) {console.log(e)}
		var sql = 'SELECT base||counter pair, lastrate FROM currencies';
	}
	

	var pairs = [];
	while (data.isValidRow()) {
		pairs.push({pair:      data.fieldByName('pair'),
		            lastRate:  data.fieldByName('lastrate')});
		data.next();
	}

	data.close();
	db.close();
	
	return pairs;
}
exports.selectPairs = selectPairs;

function updateRate(_args) {
	var pair = makePair(_args.pair);
	var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
    if (_args.rate && _args.pair) {
	var sql = 'UPDATE currencies SET lastrate = "'+_args.rate+'" WHERE base||counter = "'+pair+'";';
	try {
		db.execute(sql);
	} catch (e) {
		try {
			console.warn('here');
			db.execute('ALTER TABLE currencies ADD COLUMN lastrate number;');
		} catch (e) {console.log(e)}
		db.execute(sql);
	}
	
	db.close();
    }
}
exports.updateRate = updateRate
