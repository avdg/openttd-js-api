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
		' - year started: ' + data.serverStartYear +
		' - size: ' + data.mapWidth + 'x' + data.mapHeight
	);

	openttdClient.gamescript({test:"hello"});
	openttdClient.rcon("help");
});

openttdClient.on('protocol', function(data) {
	openttdClient.listFrequencies();
});

openttdClient.on('error', function(msg) {
	console.log('Error: ' + msg);
});

openttdClient.on('rcon', function(color, msg) {
	console.log('rcon: ' + msg);
})

openttdClient.on('console', function(origin, msg) {
	console.log(origin + " requesting '" + msg + "'");
})

openttdClient.on('end', function(reason) {
	console.log('Disconnecting (' + reason + ')');
});