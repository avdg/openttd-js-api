"use strict";

var
	events   = require('events'),
	net      = require("net"),

	generics = require("./generics"),
	settings = require("../settings"),
	spec     = generics.spec,

	tcpPacketListener;

tcpPacketListener = function(settings) {
	this.settings = settings || require("../settings");
	this._input = new Buffer(0);
	this.clients = {};
	this.commands = [];
	this.companies = {};
	this.emitter = new events.EventEmitter();

	this._log("Attempting to connect...");

	var self = this;
	this.client = net.connect(
		this.settings.port, this.settings.host,
		function() { self.defaultOnConnect.apply(self, arguments); }
	);
	this.client.on("data", function() { self.defaultOnData.apply(self, arguments); });
	this.client.on("end",  function() { self.defaultOnEnd.apply(self, arguments); });
	this.client.on("error", function() { self.defaultOnError.apply(self, arguments); });
};

tcpPacketListener.prototype.defaultOnConnect = function() {
	this._log("Client connected");
	this.emitter.emit.apply(this.emitter, ['connect'].concat(arguments));
	this.sendPacket(
		spec.AdminPacket.ADMIN_JOIN,
		[this.settings.password, this.settings.botname, this.settings.version]
	);
};

tcpPacketListener.prototype.defaultOnData = function(chunk) {
	var packet = new Buffer(0), length, packetType;

	this._input = Buffer.concat([this._input, chunk]);
	while (this._input.length > 2) {
		length = this._input.readUInt16LE(0); // Package length

		if (this._input.length < length) // Packet not fully received
			break;

		// Copy packet body
		packet = new Buffer(length);
		this._input.copy(packet, 0, 3, length);

		// Prepare packet for processing
		packetType = this._input.readUInt8(2);

		if (packetType in spec.AdminPacketDescription) {

			this._log(
				"<- " + packetType + " " +
				spec.AdminPacketDescription[packetType].name
			);

			// Process packet
			this._processData(
				packetType,
				generics.extractContent(
					spec.AdminPacketDescription[packetType].format,
					packet
				)
			);
		} else {
			this._log("<- " + packetType + " *PACKET UNKNOWN* -- skipping --");
		}

		// Remove current packet from buffer
		packet = new Buffer(this._input.length - length);
		this._input.copy(packet, 0, length, this._input.length);
		this._input = packet;
	}
};

tcpPacketListener.prototype.defaultOnEnd = function() {
	this._log('client disconnected');
	this.emitter.emit.apply(this.emitter, ['end'].concat(arguments));
};

tcpPacketListener.prototype.defaultOnError = function() {
	this.emitter.emit.apply(this.emitter, ['error'].concat(arguments));
};

tcpPacketListener.prototype.on = function() {
	this.emitter.on.apply(this.emitter, arguments);
};

tcpPacketListener.prototype.getUpdates = function(type, frequency) {
	if ( !((type % 1) && type in spec.AdminUpdateTypeArray) ) {
		type = type.toUpperCase().replace(' ', '_');
		if (type in spec.AdminUpdateType) {
			type = spec.AdminUpdateType[type];
		} else if (("ADMIN_UPDATE_" + type) in spec.AdminUpdateType) {
			type = spec.AdminUpdateType["ADMIN_UPDATE_" + type];
		} else {
			throw Error("Invalid update type given");
		}
	}

	if (!(
		(frequency % 1) &&
		type < spec.AdminUpdateFrequencyArray[spec.AdminUpdateFrequencyArray.length]
	)) {
		frequency = frequency.toUpperCase().replace(' ', '_');
		if (frequency in spec.AdminUpdateFrequency) {
			frequency = spec.AdminUpdateFrequency[frequency];
		} else if (("ADMIN_FREQUENCY_" + frequency) in spec.AdminUpdateFrequency) {
			frequency = spec.AdminUpdateFrequency["ADMIN_FREQUENCY_" + frequency];
		} else {
			throw Error("Invalid frequency type given");
		}
	}

	if (this.settings.protocolSupport[type] & spec.AdminUpdateFrequencyArray[frequency] === false) {
		throw Error("Frequency type not supported by update type");
	}

	this.sendPacket(spec.AdminPacket.ADMIN_UPDATE_FREQUENCY, [type, frequency]);
};

tcpPacketListener.prototype.poll = function(type, extra) {
	if ( !((type % 1) && type in spec.AdminUpdateTypeArray) ) {
		type = type.toUpperCase().replace(' ', '_');
		if (type in spec.AdminUpdateType) {
			type = spec.AdminUpdateType[type];
		} else if (("ADMIN_UPDATE_" + type) in spec.AdminUpdateType) {
			type = spec.AdminUpdateType["ADMIN_UPDATE_" + type];
		} else {
			throw Error("Invalid update type given");
		}
	}

	extra = parseInt(extra);
	if (extra !== extra || extra < 0) {
		extra = 0;
	} else if (extra > 0xffffffff) {
		extra = 0xffffffff;
	}

	this.sendPacket(spec.AdminPacket.ADMIN_POLL, [type, extra]);
};

tcpPacketListener.prototype.rcon = function(command) {
	this.sendPacket(spec.AdminPacket.ADMIN_RCON, [command]);
};

tcpPacketListener.prototype.gamescript = function(json) {
	this.sendPacket(spec.AdminPacket.ADMIN_GAMESCRIPT, [JSON.stringify(json)]);
};

tcpPacketListener.prototype.ping = function(id) {
	this.sendPacket(spec.AdminPacket.ADMIN_PING, [id]);
};

tcpPacketListener.prototype.disconnect = function() {
	this.sendPacket(spec.AdminPacket.ADMIN_QUIT, []);
	this.client.end();
};

tcpPacketListener.prototype.getListFrequencies = function() {
	var result = "Frequency table:\n";
	for (var i = 0, j = this.settings.protocolSupport.length; i < j; i++) {
		if (this.settings.protocolSupport[i] === null)
			continue;

		result += " - " + spec.AdminUpdateTypeArray[i] + "\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_POLL)
			result += "   + Can be polled manually\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_DAILY)
			result += "   + Can send updates daily\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_WEEKLY)
			result += "   + Can send updates weekly\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_MONTHLY)
			result += "   + Can send updates monthly\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_QUARTERLY)
			result += "   + Can send updates quarterly\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_ANUALLY)
			result += "   + Can send updates anually\n";

		if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_AUTOMATIC)
			result += "   + Can send updates when it changes\n";
	}

	return result;
};

tcpPacketListener.prototype.sendPacket = function(type, data) {
	if (type >= 100)
		throw Error(
			"Invalid package type " + type + " (expected types smaller than 100)"
		);

	if (!(type in spec.AdminPacketDescription))
		throw Error("No package of type " + type + " found");

	var format = spec.AdminPacketDescription[type].format;
	var buffer = generics.preparePacket(type, format, data);

	this._log("-> " + type + " " + spec.AdminPacketDescription[type].name);
	this.client.write(buffer);
};

tcpPacketListener.prototype._log = function(msg) {
	this.emitter.emit('log', msg + "\n");
};

tcpPacketListener.prototype._processData = function(type, data) {
	var types = spec.AdminPacket;

	switch(type) {
		case types.SERVER_FULL:
			this.emitter.emit('end', 'full');
			break;
		case types.SERVER_BANNED:
			this.emitter.emit('end', 'banned');
			break;
		case types.SERVER_ERROR:
			this.emitter.emit('error', spec.NetworkErrorCodeArray[data[0]]);
			break;
		case types.SERVER_PROTOCOL:
			this.settings.protocolVersion = data[0];
			this.settings.protocolSupport = [];
			for (var i = 0, j = data[1].length; i < j; i++)
				this.settings.protocolSupport[data[1][i][0]] = data[1][i][1];
			this.emitter.emit('protocol', this.settings);
			break;
		case types.SERVER_WELCOME:
			this.settings.serverName      = data[0];
			this.settings.serverVersion   = data[1];
			this.settings.serverDedicated = data[2];
			this.settings.serverMapName   = data[3];
			this.settings.serverSeed      = data[4];
			this.settings.serverLandscape = spec.LandscapeArray[data[5]];
			this.settings.serverStartDate = generics.gameDateToDate(data[6]);
			this.settings.mapWidth        = data[7];
			this.settings.mapHeight       = data[8];

			this.emitter.emit('welcome', this.settings);
			break;
		case types.SERVER_NEWGAME:
			this.emitter.emit('end', 'new game');
			break;
		case types.SERVER_SHUTDOWN:
			this.emitter.emit('end', 'shutdown');
			break;

		case types.SERVER_DATE:
			this.emitter.emit('date', generics.gameDateToDate(data[0]));
			break;
		case types.SERVER_CLIENT_JOIN:
			this.clients[data[0]] = this.clients[data[0]] || {};
			this.emitter.emit('clientJoin', data[0]); // client ID
			this.emitter.emit('clientUpdate');
			break;
		case types.SERVER_CLIENT_INFO:
			this.clients[data[0]]           = this.clients[data[0]] || {};
			this.clients[data[0]].hostName  = data[1];
			this.clients[data[0]].name      = data[2];
			this.clients[data[0]].language  = data[3];
			this.clients[data[0]].joinDate  = generics.gameDateToDate(data[4]);
			this.clients[data[0]].companyId = data[5];

			this.emitter.emit('clientInfo', this.clients[data[0]]);
			this.emitter.emit('clientUpdate');
			break;
		case types.SERVER_CLIENT_UPDATE:
			this.clients[data[0]]           = this.clients[data[0]] || {};
			this.clients[data[0]].name      = data[1];
			this.clients[data[0]].companyId = data[2];

			this.emitter.emit('clientUpdate', data);
			break;
		case types.SERVER_CLIENT_QUIT:
			delete this.clients[data[0]];
			this.emitter.emit('clientQuit', data[0]); // client ID
			this.emitter.emit('clientUpdate');
			break;
		case types.SERVER_CLIENT_ERROR:
			delete this.clients[data[0]];
			this.emitter.emit(
				'clientError',
				data[0],                            // Client id
				spec.NetworkErrorCodeArray[data[1]] // Reason
			);
			this.emitter.emit('clientUpdate');
			break;
		case types.SERVER_COMPANY_NEW:
			this.companies[data[0]] = this.companies[data[0]] || {};
			this.emitter.emit('companyNew', data[0]);
			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_COMPANY_INFO:
			this.companies[data[0]]            = this.companies[data[0]] || {};
			this.companies[data[0]].name       = data[1];
			this.companies[data[0]].president  = data[2];
			this.companies[data[0]].colour     = data[3];
			this.companies[data[0]].passworded = data[4];
			this.companies[data[0]].startYear  = generics.gameDateToDate(data[5]);
			this.companies[data[0]].ai         = data[6];

			this.emitter.emit('companyInfo', data[0]);
			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_COMPANY_UPDATE:
			this.companies[data[0]]              = this.companies[data[0]] || {};
			this.companies[data[0]].name         = data[1];
			this.companies[data[0]].president    = data[2];
			this.companies[data[0]].colour       = data[3];
			this.companies[data[0]].passworded   = data[4];
			this.companies[data[0]].bankrupcy    = data[5];
			this.companies[data[0]].shareholder1 = data[6];
			this.companies[data[0]].shareholder2 = data[7];
			this.companies[data[0]].shareholder3 = data[8];
			this.companies[data[0]].shareholder4 = data[9];

			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_COMPANY_REMOVE:
			delete this.companies[data[0]];
			this.emitter.emit('companyRemove', data[0]);
			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_COMPANY_ECONOMY:
			this.companies[data[0]]              = this.companies[data[0]] || {};
			this.companies[data[0]].money        = data[1];
			this.companies[data[0]].currentLoan  = data[2];
			this.companies[data[0]].income       = data[3];
			this.companies[data[0]].cargo1       = data[4];
			this.companies[data[0]].value1       = data[5];
			this.companies[data[0]].performance1 = data[6];
			this.companies[data[0]].cargo2       = data[7];
			this.companies[data[0]].value2       = data[8];
			this.companies[data[0]].performance2 = data[9];

			this.emitter.emit('companyEconomy', data[0]);
			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_COMPANY_STATS:
			this.companies[data[0]]               = this.companies[data[0]] || {};
			this.companies[data[0]].trains        = data[1];
			this.companies[data[0]].lorrys        = data[2];
			this.companies[data[0]].busses        = data[3];
			this.companies[data[0]].planes        = data[4];
			this.companies[data[0]].ships         = data[5];
			this.companies[data[0]].trainStations = data[6];
			this.companies[data[0]].lorryStations = data[7];
			this.companies[data[0]].busStations   = data[8];
			this.companies[data[0]].airport       = data[9];
			this.companies[data[0]].harbers       = data[10];

			this.emitter.emit('companyStats', data[0]);
			this.emitter.emit('companyUpdate');
			break;
		case types.SERVER_CHAT:
			this.emitter.emit('chat', {
				action:     data[0],
				destTypeId: data[1],
				destType:   spec.DestTypeArray[data[1]],
				clientId:   data[2],
				message:    data[3],
				data:       data[4]
			});
			break;
		case types.SERVER_RCON:
			this.emitter.emit('rcon', data[0], data[1]); // color, result
			break;
		case types.SERVER_CONSOLE:
			this.emitter.emit('console', data[0], data[1]); // origin, msg
			break;
		case types.SERVER_CMD_NAMES:
			for (var i = 0; i < data[0].length; i++) {
				this.commands[data[0][i][0]] = data[0][i][1];
			}
			this.emitter.emit('cmdNames', data[0]);
			break;
		case types.SERVER_CMD_LOGGING:
			this.emitter.emit('cmdLogging', {
				clientId:  data[0],
				companyId: data[1],
				commandId: data[2],
				command:   this.commands[data[2]],
				p1:        data[3],
				p2:        data[4],
				tile:      data[5],
				text:      data[6],
				frame:     data[7]
			});
			break;
		case types.SERVER_GAMESCRIPT:
			this.emitter.emit('gamescript', JSON.parse(data[0]));
			break;
		case types.SERVER_RCON_END:
			this.emitter.emit('rconEnd', data[0]);
			break;
		case types.SERVER_PONG:
			this.emitter.emit('pong', data[0]);
			break;
		default:
			break;
	}
};

module.exports = tcpPacketListener;