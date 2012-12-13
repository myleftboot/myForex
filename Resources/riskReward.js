function riskRewardView() {
	
	var self = Ti.UI.createWindow({title:'Calculate Risk:Reward'});
	
	var vertLayout = Ti.UI.createView({layout:'vertical'});
	
	var thePair = null;
	
	stockList.addEventListener('click', function(e) {showCurrencyDetail(e)});
	
	var tradeVW = Ti.UI.createView({layout: 'horizontal', top:'80%'});
	
	var takeTrade = Ti.UI.createButton({label: 'Take Trade', width : '50%'});
	takeTrade.addEventListener('click', function(e) {recordTrade(e)});
	
	
	// create the input items
	var iAccountSize  = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var iPercentRisk  = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var iRisk         = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	
	var iStopLoss     = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var iEntryPoint   = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	
	var l2xRiskReward = Ti.UI.createLabel({right:10, width:'25%', text:'0', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var l3xRiskReward = Ti.UI.createLabel({right:10, width:'25%', text:'0', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});

	var lPositionSize = Ti.UI.createLabel({right:10, width:'25%', text:'0.00', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	
	function getPip() {
		if (thePair.indexOf('JPY') > 0) return 3;
		else if (thePair.indexOf('XAU') > 0) return 2;
		else if (thePair.indexOf('XAG') > 0) return 3;
		else return 4;
	}
	
	function createTableRow(_args) {
	  var row = Ti.UI.createTableViewRow({ title: _args.title });
	  if (_args.textField) { row.add(_args.textField)};
	  if (_args.label)     {row.add(_args.label)};
	  
	  return row
	};
	// Construct the tableview
	
	var accountRisk = Ti.UI.createTableViewSection({ headerTitle: 'Risk amount' });
	accountRisk.add(createTableRow({title: 'Account Size',       textField : iAccountSize}));
	accountRisk.add(createTableRow({title: 'Percentage Risk',    textField : iPercentRisk }));
	accountRisk.add(createTableRow({title: 'or risk amount ',    textField : iRisk }));
	
	var stopAndEntry = Ti.UI.createTableViewSection({ headerTitle: 'Stop Loss and Entry Point' });
	stopAndEntry.add(createTableRow({title: 'Stop placement',    textField : iStopLoss}));
	stopAndEntry.add(createTableRow({title: 'Entry point',       textField : iEntryPoint}));
	
	var riskReward = Ti.UI.createTableViewSection({ headerTitle: 'Profit position' });
	riskReward.add(createTableRow({title: '2*Risk',              label : l2xRiskReward}));
	riskReward.add(createTableRow({title: '3*Risk',              label : l3xRiskReward}));
	
	var positionSizeSect = Ti.UI.createTableViewSection({ headerTitle: 'Position Size (lots)' });
	positionSizeSect.add(createTableRow({title: 'Position size',     label : lPositionSize}));
	
	var positionSize = Ti.UI.createTableView({
	  data: [accountRisk, stopAndEntry, riskReward, positionSizeSect]
	});
	
	function addItem(_args) {
	  var vwRow = Ti.UI.createTableViewRow({
				height: 70,
				className: 'RSSRow',
				hasDetail: true,
			});
	}
	
	// add the eventListeners
	iEntryPoint.addEventListener('change', function(e) {iRisk.fireEvent('change')});
	iStopLoss.addEventListener('change', function(e) {iRisk.fireEvent('change')});
	iPercentRisk.addEventListener('change', function(e) {setDefaults(); calculateRiskAmount(e); iRisk.fireEvent('change')});
	iAccountSize.addEventListener('change', function(e) {setDefaults(); calculateRiskAmount(e); iRisk.fireEvent('change')});
	iRisk.addEventListener('change', function(e) {calculatePositionSize(e)});
	
	function getKeyboardToolbar() {
		var done = Titanium.UI.createButton({
		    title: 'Done',
		    style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
		});
        done.addEventListener('click', function(e) {iAccountSize.blur()});
		var toolbar = Titanium.UI.iOS.createToolbar({
		    items:[done],
		    top:0,
		    borderTop:false,
		    borderBottom:true
		}); 
		
		return toolbar;
	};
	
	function calculateRiskAmount(_args) {
	  if (iPercentRisk && iAccountSize) {
	  
	    iRisk.value = (parseFloat(iAccountSize.value) * (parseFloat(iPercentRisk.value) / 100)).toFixed(2);
	  }
	};
	
	function populateDefaults() {
		iAccountSize.value  = Ti.App.Properties.getDouble('forex:AccountSize', 1000);
		iPercentRisk.value  = Ti.App.Properties.getDouble('forex:PercentRisk', 3);
		iRisk.value         = Ti.App.Properties.getDouble('forex:Risk', 50);
	}
	
	function setDefaults() {
		Ti.App.Properties.setDouble('forex:AccountSize', iAccountSize.value);
		Ti.App.Properties.setDouble('forex:PercentRisk', iPercentRisk.value);
		Ti.App.Properties.setDouble('forex:Risk', iRisk.value);
	}
	
	function calculatePositionSize(_args) {
	  // ensure mandatory items have values, otherwise do nothing
	  var risk, stopLoss, entryPoint;
	  // if this is YEN or GOLD or SILVER then multiply by 100 otherwise 10000
	  var divisor = Math.pow(10,getPip());
	  
	  if (iRisk.value && iStopLoss.value && iEntryPoint.value) {
	    
	    try {
	    
	    
	      var stopLoss = parseFloat(iStopLoss.value) * divisor;
	      var entryPoint = parseFloat(iEntryPoint.value) * divisor;
	      var pointsToStop = parseInt(Math.abs(stopLoss - entryPoint));
	      //console.log('Points to stop'+pointsToStop);
	      //console.log('Entry point'+entryPoint);
	      
	      if (stopLoss > entryPoint) {
	        l2xRiskReward.text = ((entryPoint - (pointsToStop * 2)) / divisor).toFixed(getPip());
	        l3xRiskReward.text = ((entryPoint - (pointsToStop * 3)) / divisor).toFixed(getPip());
	      } else {
	        l2xRiskReward.text = ((entryPoint + (pointsToStop * 2)) / divisor).toFixed(getPip());
	        l3xRiskReward.text = ((entryPoint + (pointsToStop * 3)) / divisor).toFixed(getPip());
	      }
	      
	      lPositionSize.text = ((parseFloat(iRisk.value) / pointsToStop) / 10).toFixed(2);
	      
	    } catch (e) {console.log(e)};
	  }
	}
	
	// Construct the view
	tradeVW.add(takeTrade);
	vertLayout.add(positionSize);
	vertLayout.add(tradeVW);
	
	self.add(vertLayout);
	
	// add the startup event listener
	self.addEventListener('calculateRisk', function(_args) {
		iEntryPoint.value = (_args.rate) ? _args.rate : null;
		thePair = _args.pair;
	});
	// set up the defaults
	populateDefaults();
	
	return self;
};
module.exports = riskRewardView;