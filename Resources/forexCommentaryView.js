function forexCommentaryView() {
	var self = Ti.UI.createWindow({title: 'Forex Commentary'});
	var forex = require('forexCommentary');
	forex.init({success: function(e) {console.log(e)}});
	var thePair, theRate = null;
	
	var mainVw = Ti.UI.createView({layout:'vertical'});
	
	var title = Ti.UI.createLabel({
		color:'#000'
	});
	
	var commentary = Ti.UI.createTextArea({
		borderWidth:2,
		borderColour:'blue',
		borderRadius:5,
	  keyboardType: Ti.UI.KEYBOARD_ASCII,
	  returnKeyType: Ti.UI.RETURNKEY_DONE,
	  textAlign: 'left',
	  hintText: 'Enter your thoughts on '+thePair,
	  top: 60,
	  width: '90%',
	  height : 150
	});
	
	commentary.addEventListener('done', function(e) {forex.addCommentary({
		                                                     pair:       thePair, 
		                                                     rate:       theRate, 
		                                                     commentary: e.value})
		                                             });
	mainVw.add(title);
	mainVw.add(commentary);
	
	self.addEventListener('currencySelected', function(e) {
		title.text = e.pair+': '+e.rate;
		thePair = forex.returnThePair(e.pair);
		theRate = e.rate;
	});
	
	self.add(mainVw);
	return self;
};

module.exports = forexCommentaryView;
