
function rightNavButton(_args) {
		// RIGHT NAVBAR REFRESH BUTTON	
	var r =  Ti.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
	});
	
	r.addEventListener('click', function(e) {_args.click();});
	
	return r;
}
exports.rightNavButton = rightNavButton;
