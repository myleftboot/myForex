function pinBarEntryView() {
        
        // PAIR
        // Risk
        var pair, risk = 0;
        
        var vwBorderWidth = 1;
        var vwBorderColor = '#000';
        var pb = {BEARSL:  '5%',
                  BULLSL:  '95%',
                  PBTOP:   '10%',
                  BEARTOP: '75%',
                  BULLTOP: '15%',
                  PBHGT:   '80%',
                  BULLBODY:'#FFF',
                  BEARBODY:'#000',
                  LINECOL: '#000',
                  SLCOL:   'red',
                  LINEWDTH: 2,
                };

        var self = Ti.UI.createWindow({title:'Pin bar Entry'});
        
        var theScreen     = Ti.UI.createView({layout:       'vertical'});
        
        var pinBarEntryVw = Ti.UI.createView({layout:       'horizontal',
                                              height:       '80%',
                                              borderWidth:  vwBorderWidth,
                                              borderColor:  vwBorderColor});
        
        var pinbarVw      = Ti.UI.createView({width:        '20%',
                                              height:       '100%',
                                              borderWidth:  vwBorderWidth,
                                              borderColor:  vwBorderColor});
        
        var entryParamsVw = Ti.UI.createView({width:        '80%',
                                              borderWidth:  vwBorderWidth,
                                              borderColor:  vwBorderColor});
                                         
        var takeProfitVw  = Ti.UI.createView({});
        
        function popDefaults() {
        	iStopLoss.value = rate;
        	iPBTop.value    = rate;
        	iPBBtm.value    = rate;
        }
        // Arguments - vw the view, bull - a bullish (true) or bearish (false) pin bar
        function drawPB(_args) {
          
          var vw = Ti.UI.createView({size: Ti.UI.FILL});
          
          var bull = (_args.bull)||false;
          
          var SL = Ti.UI.createView({
                                     width:            '100%',
                                     height:           pb.LINEWDTH,
                                     backgroundColor:  pb.SLCOL,
                                     top:              (bull) ? pb.BULLSL : pb.BEARSL,
                                    });
          
          var pbLine = Ti.UI.createView({
                                     top:              pb.PBTOP,
                                     height:           pb.PBHGT,
                                     width:            pb.LINEWDTH,
                                     backgroundColor:  pb.LINECOL,
                                     left:             '50%'
                                    });
                                    
          var pbBody = Ti.UI.createView({
                                     top:              (bull) ? pb.BULLTOP: pb.BEARTOP,
                                     borderWidth:      pb.LINEWDTH,
                                     borderColor:      pb.LINECOL,
                                     width:            '14%',
                                     height:           '10%',
                                     backgroundColor:  (bull) ? pb.BULLBODY: pb.BEARBODY,
                                     left:             '45%'
                                    });
          
          vw.add(SL);
          vw.add(pbLine);
          vw.add(pbBody);
          
          return vw;
        }
        
	// create the input items

	function getKeyboardToolbar() {
		var done = Titanium.UI.createButton({
		    title: 'Done',
		    style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
		});
        done.addEventListener('click', function(e) {iStopLoss.blur()});
		var toolbar = Titanium.UI.iOS.createToolbar({
		    items:[done],
		    top:0,
		    borderTop:false,
		    borderBottom:true
		}); 

		return toolbar;
	};
	
	var iStopLoss     = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var iPBTop        = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
	var iPBBtm        = Ti.UI.createTextField({keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD, keyboardToolbar: getKeyboardToolbar(), right:10, width:'25%', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});

        var iRetracement  = Ti.UI.createSlider({
                                      top: 50,
                                      min: 0,
                                      max: 55,
                                      width: '100%',
                                      value: 38
                                  });
    
        var lRetracement = Ti.UI.createLabel({
                                      text: iRetracement.value,
                                      width: '100%',
                                      height: 'auto',
                                      top: 30,
                                      left: 0,
                                      textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
                                      });
        
        var lEntryPoint   = Ti.UI.createLabel({right:10, width:'25%', text:'0', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});
        var l2xRiskReward = Ti.UI.createLabel({right:10, width:'25%', text:'0', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});

        var lPositionSize = Ti.UI.createLabel({right:10, width:'25%', text:'0.00', textAlign:Ti.UI.TEXT_ALIGNMENT_RIGHT});

      

	function createTableRow(_args) {
	  var row = Ti.UI.createTableViewRow({ title: _args.title });
	  if (_args.textField) { row.add(_args.textField)};
	  if (_args.label)     {row.add(_args.label)};
          if (_args.slider)    {row.add(_args.slider)};
	  return row
	};
	
	// Construct the tableview

	var stopLoss = Ti.UI.createTableViewSection({ headerTitle: 'Stop Loss' });
	stopLoss.add(createTableRow({title: 'Stop placement',        textField : iStopLoss}));

	var pinBarDets = Ti.UI.createTableViewSection({ headerTitle: 'Pin Bar Details' });
	pinBarDets.add(createTableRow({title: 'Top',                 textField : iPBTop}));
	pinBarDets.add(createTableRow({title: 'Bottom',              textField : iPBBtm}));

	var retracement = Ti.UI.createTableViewSection({ headerTitle: 'Retracement' });
	retracement.add(createTableRow({title: '% Retracement',       slider : iRetracement}));
	retracement.add(createTableRow({title: 'Retracement',         label  : lRetracement}));


	var positionSize = Ti.UI.createTableView({
	  data: [stopLoss, pinBarDets, retracement]
	});


	// add the eventListeners

        iRetracement.addEventListener('change', function(e) {
            // update the label
            lRetracement.text = String.format("%3.1f", e.value);
            // compute the take profit position
            var rr = require('common/riskreward');
            console.log('Entry point '+ rr.determineRetracement({pair          : pair,
                                                                 retracement   : e.value,
                                                                 top           : iPBTop.value,
                                                                 bottom        : iPBBtm.value,
                                                                 bull          : false})
                       );
            console.log('Take Profit 2x RR'+ rr.calculateNxRiskReward({
                                                     pair            : pair,
                                                     RR              : 2,
                                                     stopLoss        : iStopLoss.value,
                                                     entryPoint      : rr.determineRetracement({pair          : pair,
                                                                 retracement   : e.value,
                                                                 top           : iPBTop.value,
                                                                 bottom        : iPBBtm.value})
                                                     }));  

        });

	// Construct the views
	entryParamsVw.add(positionSize);
	pinBarEntryVw.add(pinbarVw);
	pinBarEntryVw.add(entryParamsVw);
	
	theScreen.add(pinBarEntryVw);
    theScreen.add(takeProfitVw);
        
	self.add(theScreen);

	// add the startup event listener
	self.addEventListener('popPinBar', function(_args) {
		pair = _args.pair;
		risk = _args.risk;
		rate = _args.rate
		pinbarVw.add(drawPB({bull:false}));
		popDefaults();
	});
    
	return self;
};
module.exports = pinBarEntryView;