var tcpPacketListener = require("./lib/openttd-adminport.js");

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

	// Frequencies:
	//  - poll
	//  - daily
	//  - weekly
	//  - monthly
	//  - quarterly
	//  - anually
	//  - automatic
	openttdClient.getUpdates('console', 'automatic'); // Update type, Frequency
});

openttdClient.on('protocol', function(data) {
	openttdClient.listFrequencies();
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

openttdClient.on('console', function(origin, msg) {
	console.log('Console: ' + origin + ": " + msg);
});

openttdClient.on('end', function(reason) {
	console.log('Disconnecting (' + reason + ')');
});