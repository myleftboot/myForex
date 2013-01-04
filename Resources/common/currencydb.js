// All source code Copyright 2013 Cope Consultancy Services. All rights reserved
// Currency database operations


// need to have last rate and selected added to table

var db = Ti.Database.install('db/currencies.sqlite', 'currencies');

function selectPairs(_args) {
  
	var sql = 'SELECT base||counter pair FROM currencies';
	var data = db.execute(sql);

	var pairs = [];
	while (data.isValidRow()) {
		data.next();
		pairs.push({pair:      data.fieldByName('pair'),
		            lastRate:  '1.0000'});
	}

	data.close();
	db.close();
	
	return pairs;
}
exports.selectPairs = selectPairs;

function updateRate(_args) {
    if (_args.rate && _args.pair) {
	var sql = 'UPDATE currencies SET lastrate = "'+_args.rate+'" WHERE base||counter = "'+_args.pair+'";';
	db.execute(sql);
	db.close();
    }
}
exports.updateRate = updateRate
