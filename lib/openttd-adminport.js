"use strict";

var
	events   = require('events'),
	net      = require("net"),
	util     = require("util"),

	settings = require("../settings"),
	spec     = require("../data");

var tcpPacketListener;

var sendTypeTable = {
	"uint8":    function(input) {var buffer=new Buffer(1);buffer.writeUInt8   (input, 0); return buffer;},
	"int8":     function(input) {var buffer=new Buffer(1);buffer.writeInt8    (input, 0); return buffer;},
	"uint16be": function(input) {var buffer=new Buffer(2);buffer.writeUInt16BE(input, 0); return buffer;},
	"uint16le": function(input) {var buffer=new Buffer(2);buffer.writeUInt16LE(input, 0); return buffer;},
	"int16be":  function(input) {var buffer=new Buffer(2);buffer.writeInt16BE (input, 0); return buffer;},
	"int16le":  function(input) {var buffer=new Buffer(2);buffer.writeInt16LE (input, 0); return buffer;},
	"uint32be": function(input) {var buffer=new Buffer(4);buffer.writeUInt32BE(input, 0); return buffer;},
	"uint32le": function(input) {var buffer=new Buffer(4);buffer.writeUInt32LE(input, 0); return buffer;},
	"int32be":  function(input) {var buffer=new Buffer(4);buffer.writeInt32BE (input, 0); return buffer;},
	"int32le":  function(input) {var buffer=new Buffer(4);buffer.writeInt32LE (input, 0); return buffer;},
	"floatbe":  function(input) {var buffer=new Buffer(4);buffer.writeFloatBE (input, 0); return buffer;},
	"floatle":  function(input) {var buffer=new Buffer(4);buffer.writeFloatLE (input, 0); return buffer;},
	"doublebe": function(input) {var buffer=new Buffer(8);buffer.writeDoubleBE(input, 0); return buffer;},
	"doublele": function(input) {var buffer=new Buffer(8);buffer.writeDoubleLE(input, 0); return buffer;},
	"bool":     function(input) {var buffer=new Buffer(1);buffer.writeUInt8(input ? 1 : 0, 0); return buffer;},
	"utf8":     function(input) {return new Buffer(input.replace("\u0000", "") + "\u0000", 'utf8');}
};

var receiveTypeTable = {
	"bool":     function(buffer, offset) {return [buffer.readUInt8(offset) === 1, 1];},
	"uint8":    function(buffer, offset) {return [buffer.readUInt8(offset),       1];},
	"int8":     function(buffer, offset) {return [buffer.readInt8(offset),        1];},
	"uint16be": function(buffer, offset) {return [buffer.readUInt16BE(offset),    2];},
	"uint16le": function(buffer, offset) {return [buffer.readUInt16LE(offset),    2];},
	"int16be":  function(buffer, offset) {return [buffer.readInt16BE(offset),     2];},
	"int16le":  function(buffer, offset) {return [buffer.readInt16LE(offset),     2];},
	"uint32be": function(buffer, offset) {return [buffer.readUInt32BE(offset),    4];},
	"uint32le": function(buffer, offset) {return [buffer.readUInt32LE(offset),    4];},
	"int32be":  function(buffer, offset) {return [buffer.readInt32BE(offset),     4];},
	"int32le":  function(buffer, offset) {return [buffer.readInt32LE(offset),     4];},
	"floatbe":  function(buffer, offset) {return [buffer.readFloatBE(offset),     4];},
	"floatle":  function(buffer, offset) {return [buffer.readFloatLE(offset),     4];},
	"doublebe": function(buffer, offset) {return [buffer.readDoubleBE(offset),    8];},
	"doublele": function(buffer, offset) {return [buffer.readDoubleLE(offset),    8];},
	"uint64be": function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+4);return [newBuffer, 8];},
	"uint64le": function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+4);return [newBuffer, 8];},
	"int64be":  function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+4);return [newBuffer, 8];},
	"int64le":  function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+4);return [newBuffer, 8];},
	"utf8":     function(buffer, offset) {
		var pos = offset;
		for (;buffer[pos] !== 0x00; pos++) {}
		return [buffer.toString('utf8', offset, pos), pos - offset + 1];
	},
	"protocol": function(buffer, offset) {
		var pos = offset, result = [];
		while (buffer.readUInt8(pos)==1) {
			result[result.length] = [buffer.readUInt16LE(pos + 1), buffer.readUInt16LE(pos + 3)];
			pos += 5;
		}
		return [result, pos - offset];
	},
	"cmdNames": function() {
		var pos = offset, pos2, result = [];
		while (buffer.readUInt8(pos)==1) {
			result[result.length] = [buffer.readUInt16(pos + 1)]
			for (pos += 3, pos2 = pos; buffer[pos] !== 0x00; pos++) {}
			result[result.length -1][1] = buffer.toString('utf8', pos2, pos);
		}
	}
};

var inverseTable = {
	'AdminStatus':              'AdminStatusArray',
	'AdminUpdateType':          'AdminUpdateTypeArray',
	'AdminUpdateFrequency':     'AdminUpdateFrequencyArray',
	'AdminCompanyRemoveReason': 'AdminCompanyRemoveReasonArray',
	'Colour':                   'ColourArray',
	'DestType':                 'DestTypeArray',
	'Landscape':                'LandscapeArray',
	'NetworkAction':            'NetworkActionArray',
	'NetworkErrorCode':         'NetworkErrorCodeArray',
	'NetworkLanguage':          'NetworkLanguageArray',
	'VehicleType':              'VehicleTypeArray'
};

var getInversedObject = function(object) {
	var result = {};

	for (var i in object) {
		result[object[i]] = i;
	}

	return result;
};

var isLeapYear = function(year) {
	return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

var daysInMonth = function(month, year) {
	return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

var getQuarter = function(month) {
	return Math.floor((month + 2) / 3);
}

// Year calculation based on
// http://dev.openttdcoop.org/projects/joan/repository/entry/src/main/java/org/openttd/GameDate.java
var gameDateToDate = function(date) {
	var rem, year, month = -1, days = 0;

	// There are 97 leap years in 400 years
	year = 400 * Math.floor(date / (365 * 400 + 97));
	rem  = date % (365 * 400 + 97);

	// There are 24 leap years in 100 years
	year += 100 * Math.floor(rem / (365 * 100 + 24));
	rem  %= 365 * 100 + 24;

	// There is 1 leap year every 4 years
	year += 4 * Math.floor(rem / (365 * 4 + 1));
	rem  %= 365 * 4 + 1;

	// Finish year calculation
	while (rem >= (isLeapYear(year) ? 366 : 365)) {
		rem -= isLeapYear(year) ? 366 : 365;
		year++;
	}

	// Calculate month
	do {
		month++;
		rem -=  days;
		days = daysInMonth(month, year);
	} while (rem > days);

	// Rem should be day in the month
	return {year: year, month: month, day: rem + 1, quarter: getQuarter(month)};
}

module.exports = tcpPacketListener = (function() {
	var self;

	function tcpPacketListener() {
		this.input = Buffer(0);
		this.emitter = new events.EventEmitter;
		this.settings = {};
		self = this;

		console.log("Attempting to connect...");

		this.client = net.connect(
			settings.port,settings.host, this.defaultOnConnect
		);
		this.client.on("data", this.defaultOnData);
		this.client.on("end",  this.defaultOnEnd);
	}

	tcpPacketListener.prototype.defaultOnConnect = function() {
		console.log("Client connected");
		self.sendPacket(
			spec.PackageType.ADMIN_PACKET_ADMIN_JOIN,
			[settings.password, settings.botname, settings.version]
		);
	}

	tcpPacketListener.prototype.extractData = function(format, packet) {
		var data = [], result, offset = 0, type;

		for (var i = 0; i < format.length; i++) {
			type = format[i].type.toLowerCase();

			if (receiveTypeTable[type] === null)
				throw "type " + type + " not known in send table";

			result = receiveTypeTable[type](packet, offset);
			data[data.length] = result[0];
			offset           += result[1];
		}

		return data;
	}

	tcpPacketListener.prototype.defaultOnData = function (chunk) {
		var packet = Buffer(0), length, packetType; 

		self.input = Buffer.concat([self.input, chunk]);
		while (self.input.length > 2) {
			length = self.input.readUInt16LE(0); // Package length

			if (self.input.length < length)
				break;

			// Remove a packet from the buffer with length and type stripped
			packet = new Buffer(length);
			self.input.copy(packet, 0, 3, length);

			// Prepare packet for processing
			packetType = self.input.readUInt8(2);

			console.log(
				"<- " + packetType + " " +
				spec.PackageDescription[packetType].name
			);

			// Invalid packet
			if (packetType < 100)
				throw "Invalid package type " + packetType +
					" (expected type 100 or larger)";

			// Unknown packages
			if (spec.PackageDescription[packetType] === null) {
				console.log(
					"Packet " + packetType +
					" invalid or lacking a package description"
				);
				continue;
			}

			// Process packet
			self.processData(
				packetType,
				self.extractData(
					spec.PackageDescription[packetType].format,
					packet
				)
			);

			// Remove current packet from buffer
			packet = new Buffer(self.input.length - length);
			self.input.copy(packet, 0, length, self.input.length);
			self.input = packet;
		}
	}

	tcpPacketListener.prototype.defaultOnEnd = function() {
		console.log('client disconnected');
	}

	tcpPacketListener.prototype.on = function () {
		this.emitter.on.apply(this.emitter, arguments);
	}

	// xxx lacking bounce checks
	tcpPacketListener.prototype.getUpdates = function (type, frequency) {
		this.sendPacket(spec.PackageType.ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY, [
			spec.AdminUpdateType[
				"ADMIN_UPDATE_" + type.toUpperCase().replace(' ',  '_')
			],
			spec.AdminUpdateFrequency[
				"ADMIN_FREQUENCY_" + frequency.toUpperCase().replace(' ', '_')
			]
		]);
	}

	// xxx lacking bounce checks
	tcpPacketListener.prototype.poll = function (type, extra) {
		this.sendPacket(spec.PackageType.ADMIN_PACKET_ADMIN_POLL, [
			spec.AdminUpdateType[
				"ADMIN_UPDATE_" + type.toUpperCase().replace(' ',  '_')
			],
			extra
		]);
	}

	tcpPacketListener.prototype.rcon = function (command) {
		this.sendPacket(spec.PackageType.ADMIN_PACKET_ADMIN_RCON, [command]);
	}

	tcpPacketListener.prototype.gamescript = function (json) {
		this.sendPacket(spec.PackageType.ADMIN_PACKET_ADMIN_GAMESCRIPT, [JSON.stringify(json)]);
	}

	tcpPacketListener.prototype.disconnect = function () {
		this.sendPacket(spec.PackageType.ADMIN_PACKET_ADMIN_QUIT, []);
	}

	tcpPacketListener.prototype.listFrequencies = function () {
		console.log("Frequency table:");
		for (var i = 0, j = this.settings.protocolSupport.length; i < j; i++) {
			if (this.settings.protocolSupport[i] === null)
				continue;

			console.log(" - " + spec.AdminUpdateTypeArray[i]);

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_POLL)
				console.log("   + Can be polled manually");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_DAILY)
				console.log("   + Can send updates daily");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_WEEKLY)
				console.log("   + Can send updates weekly");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_MONTHLY)
				console.log("   + Can send updates monthly");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_QUARTERLY)
				console.log("   + Can send updates quarterly");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_ANUALLY)
				console.log("   + Can send updates anually");

			if (this.settings.protocolSupport[i] & spec.AdminUpdateFrequency.ADMIN_FREQUENCY_AUTOMATIC)
				console.log("   + Can send updates when it changes");
		}
	}

	tcpPacketListener.prototype.sendPacket = function(type, data) {
		if (type >= 100)
			throw "Invalid package type " +
				type + " (expected types smaller than 100)";

		var buffer = [new Buffer(3)]; // First 3 bits represents packet length and type
		var format = spec.PackageDescription[type].format;

		// Format data in buffers and merge them to the package format
		for (var i = 0, length = Math.min(format.length, data.length); i < length; i++) {
			if (sendTypeTable[format[i].type] === null)
				throw "Type " + format[i].type + " not known in send table";
			buffer.push(sendTypeTable[format[i].type.toLowerCase()](data[i]));
		}

		buffer = Buffer.concat(buffer)

		// Length check
		if (buffer.length > 900)
			throw "Message too long";

		// Pre-append length and packet type
		buffer.writeUInt8(type, 2);
		buffer.writeUInt16LE(buffer.length, 0);

		console.log("-> " + type + " " + spec.PackageDescription[type].name);
		this.client.write(buffer);
	}

	tcpPacketListener.prototype.processData = function(type, data) {
		var types = spec.PackageType;

		switch(type) {
			case types.ADMIN_PACKET_SERVER_FULL:
				this.emitter.emit('end', 'full');
				break;
			case types.ADMIN_PACKET_SERVER_BANNED:
				this.emitter.emit('end', 'banned');
				break;
			case types.ADMIN_PACKET_SERVER_ERROR:
				this.emitter.emit('error', spec.NetworkErrorCodeArray[data[0]]);
				break;
			case types.ADMIN_PACKET_SERVER_PROTOCOL:
				this.settings.protocolVersion = data[0];
				this.settings.protocolSupport = [];
				for (var i = 0, j = data[1].length; i < j; i++)
					this.settings.protocolSupport[data[1][i][0]] = data[1][i][1];
				this.emitter.emit('protocol', this.settings);
				break;
			case types.ADMIN_PACKET_SERVER_WELCOME:
				this.settings.serverName      = data[0];
				this.settings.serverVersion   = data[1];
				this.settings.serverDedicated = data[2];
				this.settings.serverMapName   = data[3];
				this.settings.serverSeed      = data[4]
				this.settings.serverLandscape = spec.LandscapeArray[data[5]];
				this.settings.serverStartDate = gameDateToDate(data[6]);
				this.settings.mapWidth        = data[7];
				this.settings.mapHeight       = data[8];

				this.emitter.emit('welcome', this.settings);
				break;
			case types.ADMIN_PACKET_SERVER_NEWGAME:
				this.emitter.emit('end', 'new game');
				break;
			case types.ADMIN_PACKET_SERVER_SHUTDOWN:
				this.emitter.emit('end', 'shutdown');
				break;

			case types.ADMIN_PACKET_SERVER_DATE:
				this.emitter.emit('date', gameDateToDate(data[0]));
				break;
			case types.ADMIN_PACKET_SERVER_CLIENT_JOIN:
			case types.ADMIN_PACKET_SERVER_CLIENT_INFO:
			case types.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
			case types.ADMIN_PACKET_SERVER_CLIENT_QUIT:
			case types.ADMIN_PACKET_SERVER_CLIENT_ERROR:
			case types.ADMIN_PACKET_SERVER_COMPANY_NEW:
			case types.ADMIN_PACKET_SERVER_COMPANY_INFO:
			case types.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
			case types.ADMIN_PACKET_SERVER_COMPANY_REMOVE:
			case types.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
			case types.ADMIN_PACKET_SERVER_COMPANY_STATS:
			case types.ADMIN_PACKET_SERVER_CHAT:
				break;
			case types.ADMIN_PACKET_SERVER_RCON:
				this.emitter.emit('rcon', data[0], data[1]); // color, result
				break;
			case types.ADMIN_PACKET_SERVER_CONSOLE: // xxx Test
				this.emitter.emit('console', data[0], data[1]); // origin, msg
				break;
			case types.ADMIN_PACKET_SERVER_CMD_NAMES:
			case types.ADMIN_PACKET_SERVER_CMD_LOGGING:
				break;
			case types.ADMIN_PACKET_SERVER_GAMESCRIPT:
				this.emitter.emit('gamescript', JSON.parse(data[0]));
				break;
			default:
				break;
		}
	}

	return tcpPacketListener;
})();

for (var i in inverseTable) {
	spec[inverseTable[i]] = getInversedObject(spec[i]);
}
