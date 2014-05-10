var tcpPacketListener = require("../lib/openttd-adminport.js");

var openttdClient = new tcpPacketListener();

openttdClient.on('welcome', function(data) {
	var climate = {
		LANDSCAPE_TEMPERATE: 'temperate',
		LANDSCAPE_ARTIC:     'artic',
		LANDSCAPE_TROPIC:    'tropic',
		LANDSCAPE_TOYLAND:   'toyland',
	}

	console.log(
		'Joined server "' + data.serverName +
		'" running openttd version ' + data.serverVersion
	);

	console.log(
		'Dedicated: ' + data.serverDedicated +
		' - Climate: ' + climate[data.serverLandscape] +
		' - map: "' + data.serverMapName + '"' +
		' - date started: ' + data.serverStartDate.day +
		'-' + data.serverStartDate.month +
		'-' + data.serverStartDate.year +
		' - size: ' + data.mapWidth + 'x' + data.mapHeight
	);

	openttdClient.gamescript({test:"hello"});
	openttdClient.rcon("help");

	// Update types:
	//  - date
	//  - client info
	//  - company info
	//  - company economy
	//  - company stats
	//  - chat
	//  - console
	//  - cmd names
	//  - cmd logging
	//  - gamescript
	openttdClient.poll("date", 0); // Update type, Extra data
	openttdClient.poll('client info', 0xFFFFFFFF); // OpenTTD 1.3.1, pls say something
	openttdClient.poll('company info', 0xFFFFFFFF);
	openttdClient.poll('company economy', 0);
	openttdClient.poll('company stats', 0);
	openttdClient.poll('cmd names', 0);

	// Lets poll more data for testing purposes, everytime in a slightly different way
	openttdClient.poll('admin_UpdaTe_dATE', 0);
	openttdClient.poll('date');

	// Frequencies:
	//  - poll
	//  - daily
	//  - weekly
	//  - monthly
	//  - quarterly
	//  - anually
	//  - automatic
	openttdClient.getUpdates('console', 'automatic'); // Update type, Frequency
	openttdClient.getUpdates('client info', 'automatic');
	openttdClient.getUpdates('company info', 'automatic');
	openttdClient.getUpdates('company economy', 'weekly');
	openttdClient.getUpdates('company stats', 'weekly');
	openttdClient.getUpdates('cmd logging', 'automatic');
	openttdClient.getUpdates('chat', 'automatic');

	// Lets subscribe multiple times for testing purposes, every time in a slightly different way
	openttdClient.getUpdates('admin_uPdATe_cONsole', 'automatic');

	setTimeout(function() {openttdClient.ping(1234);}, 100);
});

openttdClient.on('protocol', function(data) {
	console.log(openttdClient.getListFrequencies());
});

openttdClient.on('error', function(msg) {
	console.log('Error: ' + msg);
});

openttdClient.on('rcon', function(color, msg) {
	console.log('rcon: ' + msg);
});

openttdClient.on('date', function(date) {
	console.log(
		'Current date: ' + date.day + '-' + date.month + '-' + date.year +
		' quarter ' + date.quarter
	);
});

openttdClient.on('clientUpdate', function() {
	console.log('Clients:');

	if (Object.keys(openttdClient.clients).length > 0) {
		for (var i in openttdClient.clients) {
			console.log("  Client id " + i + ": " + JSON.stringify(openttdClient.clients[i]));
		}
	} else {
		console.log("  NONE");
	}
});

openttdClient.on('companyUpdate', function() {
	console.log('Companies:');

	if (Object.keys(openttdClient.companies).length > 0) {
		for (var i in openttdClient.companies) {
			console.log("  Company id " + i + ": " + JSON.stringify(openttdClient.companies[i]));
		}
	} else {
		console.log("  NONE");
	}
})

openttdClient.on('console', function(origin, msg) {
	console.log('Console: ' + origin + ": " + msg);
});

openttdClient.on('cmdNames', function() {
	console.log('Available commands:');
	for (var i = 0; i < openttdClient.commands.length; i++) {
		console.log(' - ' + openttdClient.commands[i] + ' <id ' + i + '>');
	}
});

openttdClient.on('cmdLogging', function(data) {
	console.log('Log: ' + JSON.stringify(data));
});

openttdClient.on('chat', function(data) {
	console.log('Chat: ' + JSON.stringify(data));
});

openttdClient.on('log', function(msg) {
	console.log(msg.substr(0, msg.length - 1));
});

openttdClient.on('end', function(reason) {
	console.log('Disconnecting (' + reason + ')');
});

openttdClient.on('rconEnd', function(command) {
	console.log('"' + command + '" executed');
})

openttdClient.on('pong', function(id) {
	console.log('Received pong from server with id ' + id);
});