# Flic Hub (Flic buttons) integration using Flic Hub SDK and Home Assistant binary sensors/automations

Flic Hub has an SDK, which you can access sitting on your local network and accessing the url:

https://hubsdk.flic.io/ 66

In there, login and click on “Create Module” and give it a name (whichever you want), go to main.js and paste the code below. From here onwards, modify only what is in [SQUARE BRACKETS AND CAPS]

```javascript
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
```

Click on the “Restart after crash” so it will restart after every reboot, and then click the Play button. This will save your code and execute it, you should see it in the console.

Now it is time to move to HA. You will then add to your configuration.yaml the following snippet. Please note, you must know the names of the buttons, which it is assumed you do since you first added them to your hub as normal. Also, if you have more than one button, just have one “template:” definition on top, and just copy/paste as of the “- trigger:” line below as many times as needed

```yaml
template:
  - trigger:
      - platform: webhook
        webhook_id: [NAME OF YOUR WEBHOOK]-[NAME OF YOUR BUTTON]

    binary_sensor:
      - unique_id: "[NAME OF YOUR BUTTON]_button"
        name: "[NAME OF YOUR BUTTON] Button"
        state: "on"
        auto_off: 0.1
        attributes:
          click-type: "{{ trigger.json.click_type }}"
          battery: "{{ trigger.json.battery_status }}"
```

Finally, to interact with your button presses or holds, you can now go and create automations based on the binary sensor state and attributes, as follows:

```yaml
- id: '[UNIQUE ID SO YOU CAN EDIT FROM THE UI IF YOU WISH TO]'
  alias: [NAME OF YOUR AUTOMATION]
  description: ''
  trigger:
  - platform: state
    entity_id:
    - binary_sensor.[NAME OF YOUR BUTTON]_button
    from: 'off'
    to: 'on'
  condition:
  - condition: state
    entity_id: binary_sensor.[NAME OF YOUR BUTTON]_button
    attribute: click-type
    state: [POSSIBLE VALUES ARE: click, double_click, hold]
  action:
  - [YOUR ACTION, TURN OFF THE TV, PLAY MUSIC, CLOSE THE FRONT DOOR, ETC]
  mode: single
```

Create an automation for each button and press type combination, example: Button1 - Click, Button1 - Double Click, Button1 - Hold, etc etc, until you have all your buttons mapped out. You can also do the same with the battery_status attribute, should you wish to be notified when your buttons are running low on juice.

Have fun clicking away!