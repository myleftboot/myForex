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

function getRate(_args) {
    var base      = _args.base;
    var counter   = _args.counter;
    
    var retval = 0;
    if (base && counter) {
      var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
	var sql = 'SELECT lastrate FROM currencies WHERE base||counter = "'+base+counter+'";';
	try {
		var data = db.execute(sql);
	} catch(e) {
		try {
			db.execute('ALTER TABLE currencies ADD COLUMN lastrate number;');
			db.execute('ALTER TABLE currencies ADD COLUMN last_updated integer;');
		} catch (e) {console.log(e)}
	}
	while (data.isValidRow()) {
		var retval = data.fieldByName('lastrate')});
	}

	data.close();
	db.close();
    }
    return retval;
}
exports.getRate = getRate;

function getPipDP(_args) {
    var counter = makePair(_args.counter);
    var retval  = 0;
    var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
	var sql = 'SELECT pipdp FROM currencies WHERE counter = "'+counter+'";';
	try {
		var data = db.execute(sql);
	} catch(e) {
		try {
			db.execute('ALTER TABLE currencies ADD COLUMN pipdp number;');
			db.execute('UPDATE  currencies set pipdp = CASE counter WHEN "USD" THEN 5 WHEN "JPY" THEN 3 WHEN "CHF" THEN 3 ELSE 0 END;');
			var data = db.execute(sql);
		} catch (e) {console.log(e)}
	}
	while (data.isValidRow()) {
		var retval = data.fieldByName('pipdp')});
	}

	data.close();
	db.close();

	return retval;
}
exports.getPipDP = getPipDP;

function updateRate(_args) {
	var pair = makePair(_args.pair);
	var db = Ti.Database.install('db/currencies.sqlite', 'currencies');
    if (_args.rate && _args.pair) {
	var sql = 'UPDATE currencies SET lastrate = "'+_args.rate+'", last_updated = DATE(''now'')  WHERE base||counter = "'+pair+'";';
	try {
		db.execute(sql);
	} catch (e) {
		try {
			db.execute('ALTER TABLE currencies ADD COLUMN lastrate number;');
			db.execute('ALTER TABLE currencies ADD COLUMN last_updated integer;');
		} catch (e) {console.log(e)}
		db.execute(sql);
	}

	db.close();
    }
}
exports.updateRate = updateRate;
