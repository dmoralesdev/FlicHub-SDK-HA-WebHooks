// main.js
var buttonManager = require("buttons");
var http = require("http");
var url = "http://[LOCAL IP OF YOUR HA INSTANCE]:8123/api/webhook/[NAME OF YOUR WEBHOOK]-";

buttonManager.on("buttonSingleOrDoubleClickOrHold", function(obj) {
	var button = buttonManager.getButton(obj.bdaddr);
	var clickType = obj.isSingleClick ? "click" : obj.isDoubleClick ? "double-click" : "hold";

	http.makeRequest({
		url: url + button.name,
		method: "POST",
		headers: {"Content-Type": "application/json"},
		content: JSON.stringify({"button_name": button.name, "serial_number": button.serialNumber, "click_type": clickType, "battery_status": button.batteryStatus }),
	}, function(err, res) {
		console.log("request status: " + res.statusCode);
	});
});

console.log("Started");