var generics;

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

module.exports = generics = {};

// Protocol data

// Swaps keys with values
generics.getInversedObject = function(object) {
	var result = {};

	for (var i in object) {
		result[object[i]] = i;
	}

	return result;
};

generics.spec = require("../data/protocol")
for (var i in inverseTable) {
	generics.spec[inverseTable[i]] = generics.getInversedObject(generics.spec[i]);
}

// Date handling

generics.isLeapYear = function(year) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

generics.daysInMonth = function(month, year) {
	return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

generics.getQuarter = function(month) {
	return Math.floor(((month + 10) % 12) / 3);
};

// Year calculation based on
// http://dev.openttdcoop.org/projects/joan/repository/entry/src/main/java/org/openttd/GameDate.java
generics.gameDateToDate = function(date) {
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
	while (rem >= (this.isLeapYear(year) ? 366 : 365)) {
		rem -= this.isLeapYear(year) ? 366 : 365;
		year++;
	}

	// Get month
	do {
		month++;
		rem -=  days;
		days = this.daysInMonth(month, year);
	} while (rem > days);

	// Rem should be day in the month
	return {year: year, month: month, day: rem + 1, quarter: this.getQuarter(month)};
};

// Network stuff

generics.typeTableSend = {
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

generics.typeTableReceive = {
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
	"uint64be": function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+8);return [newBuffer, 8];},
	"uint64le": function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+8);return [newBuffer, 8];},
	"int64be":  function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+8);return [newBuffer, 8];},
	"int64le":  function(buffer, offset) {var newBuffer=new Buffer(8);buffer.copy(newBuffer,0,offset,offset+8);return [newBuffer, 8];},
	"utf8":     function(buffer, offset) {
		var pos = offset;
		for (;buffer[pos] !== 0x00; pos++) {}
		return [buffer.toString('utf8', offset, pos), pos - offset + 1];
	},
	"protocol": function(buffer, offset) {
		var pos = offset, result = [];
		while (buffer.readUInt8(pos) === 1) {
			result[result.length] = [buffer.readUInt16LE(pos + 1), buffer.readUInt16LE(pos + 3)];
			pos += 5;
		}
		return [result, pos - offset];
	},
	"cmdnames": function(buffer, offset) {
		var pos = offset, pos2, result = [];
		while (buffer.readUInt8(pos) === 1) {
			result[result.length] = [buffer.readUInt16LE(pos + 1)];
			for (pos += 3, pos2 = pos; buffer[pos] !== 0x00; pos++) {}
			result[result.length -1][1] = buffer.toString('utf8', pos2, pos);
			pos++;
		}
		return [result, pos - offset];
	}
};

generics.preparePacket = function(type, format, data) {
	// First 3 bytes represents packet length and type
	var buffer = [new Buffer(3)];

	// Format data in buffers and merge them to the package format
	for (var i = 0, length = Math.min(format.length, data.length); i < length; i++) {
		if (generics.typeTableSend[format[i].type] === null)
			throw "Type " + format[i].type + " not known in send table";

		buffer.push(generics.typeTableSend[format[i].type.toLowerCase()](data[i]));
	}

	buffer = Buffer.concat(buffer);

	// Length check
	if (buffer.length > 1460)
		throw "Message too long";

	// Pre-append length and packet type
	buffer.writeUInt8(type, 2);
	buffer.writeUInt16LE(buffer.length, 0);

	return buffer;
};

generics.extractContent = function(format, content) {
	var data = [], result, offset = 0, type;

	// Extract data given the package format
	for (var i = 0; i < format.length; i++) {
		type = format[i].type.toLowerCase();

		if (generics.typeTableReceive[type] === null)
			throw "unknown data type " + type;

		result = generics.typeTableReceive[type](content, offset);
		data[data.length] = result[0];
		offset           += result[1];
	}

	return data;
};