// Hopefully easy to reuse json data (after stripping the comments) about the openttd admin port protocol ;-)
module.exports = {
	Version: 1,
	PackageType: {
		// Types of send packages
		ADMIN_PACKET_ADMIN_JOIN:               0, // The admin announces and authenticates itself to the server.
		ADMIN_PACKET_ADMIN_QUIT:               1, // The admin tells the server that it is quitting.
		ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY:   2, // The admin tells the server the update frequency of a particular piece of information.
		ADMIN_PACKET_ADMIN_POLL:               3, // The admin explicitly polls for a piece of information.
		ADMIN_PACKET_ADMIN_CHAT:               4, // The admin sends a chat message to be distributed.
		ADMIN_PACKET_ADMIN_RCON:               5, // The admin sends a remote console command.
		ADMIN_PACKET_ADMIN_GAMESCRIPT:         6, // The admin sends a JSON string for the Gamescript.

		// Types of receive packages
		ADMIN_PACKET_SERVER_FULL:            100, // The server tells the admin it cannot accept the admin.
		ADMIN_PACKET_SERVER_BANNED:          101, // The server tells the admin it is banned.
		ADMIN_PACKET_SERVER_ERROR:           102, // The server tells the admin an error has occured.
		ADMIN_PACKET_SERVER_PROTOCOL:        103, // The server tells the admin its protocol version.
		ADMIN_PACKET_SERVER_WELCOME:         104, // The server welcomes the admin to a game.
		ADMIN_PACKET_SERVER_NEWGAME:         105, // The server tells the admin its going to start a new game.
		ADMIN_PACKET_SERVER_SHUTDOWN:        106, // The server tells the admin its shutting down.

		ADMIN_PACKET_SERVER_DATE:            107, // The server tells the admin what the current game date is.
		ADMIN_PACKET_SERVER_CLIENT_JOIN:     108, // The server tells the admin that a client has joined.
		ADMIN_PACKET_SERVER_CLIENT_INFO:     109, // The server gives the admin information about a client.
		ADMIN_PACKET_SERVER_CLIENT_UPDATE:   110, // The server gives the admin an information update on a client.
		ADMIN_PACKET_SERVER_CLIENT_QUIT:     111, // The server tells the admin that a client quit.
		ADMIN_PACKET_SERVER_CLIENT_ERROR:    112, // The server tells the admin that a client caused an error.
		ADMIN_PACKET_SERVER_COMPANY_NEW:     113, // The server tells the admin that a new company has started.
		ADMIN_PACKET_SERVER_COMPANY_INFO:    114, // The server gives the admin information about a company.
		ADMIN_PACKET_SERVER_COMPANY_UPDATE:  115, // The server gives the admin an information update on a company.
		ADMIN_PACKET_SERVER_COMPANY_REMOVE:  116, // The server tells the admin that a company was removed.
		ADMIN_PACKET_SERVER_COMPANY_ECONOMY: 117, // The server gives the admin some economy related company information.
		ADMIN_PACKET_SERVER_COMPANY_STATS:   118, // The server gives the admin some statistics about a company.
		ADMIN_PACKET_SERVER_CHAT:            119, // The server received a chat message and relays it.
		ADMIN_PACKET_SERVER_RCON:            120, // The server's reply to a remove console command.
		ADMIN_PACKET_SERVER_CONSOLE:         121, // The server gives the admin the data that got printed to its console.
		ADMIN_PACKET_SERVER_CMD_NAMES:       122, // The server sends out the names of the DoCommands to the admin.
		ADMIN_PACKET_SERVER_CMD_LOGGING:     123, // The server gives the admin copies of incoming command packets.
		ADMIN_PACKET_SERVER_GAMESCRIPT:      124, // The server gives the admin information from the GameScript in JSON.

		INVALID_ADMIN_PACKET:                0xFF // An invalid marker for admin packets.
	},

	// Description of the format of a package type
	PackageDescription: {
		// Optional parameters have "optional: 1" in the parameter object
		0: {
			name: "ADMIN_PACKET_ADMIN_JOIN",
			format: [
				{name: "password", type: "utf8"},
				{name: "botname",  type: "utf8"},
				{name: "version",  type: "utf8"}
			],
		},
		1: {
			name: "ADMIN_PACKET_ADMIN_QUIT",
			format: [],
		},
		2: {
			name: "ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY",
			format: [
				{name: "type", type: "UInt16LE"},
				{name: "freq", type: "UInt16LE"}
			],
		},
		3: {
			name: "ADMIN_PACKET_ADMIN_POLL",
			format: [
				{name: "type",  type: "UInt16LE"},
				{name: "extra", type: "UInt32LE"}
			],
		},
		4: {
			name: "ADMIN_PACKET_ADMIN_CHAT",
			format: [
				{name: "action",   type: "UInt8"},
				{name: "desttype", type: "UInt8"},
				{name: "clientId", type: "UInt32LE"},
				{name: "message",  type: "utf8"}
			]
		},
		5: {
			name: "ADMIN_PACKET_ADMIN_RCON",
			format: [
				{name: "command", type: "utf8"}
			]
		},
		6: {
			name: "ADMIN_PACKET_ADMIN_GAMESCRIPT",
			format: [
				{name: "json", type: "utf8"}
			]
		},
	
		100: {
			name: "ADMIN_PACKET_SERVER_FULL",
			format: [],
		},
		101: {
			name: "ADMIN_PACKET_SERVER_BANNED",
			format: [],
		},
		102: {
			name: "ADMIN_PACKET_SERVER_ERROR",
			format: [
				{name: "errorCode", type: "UInt8"}
			],
		},
		103: {
			name: "ADMIN_PACKET_SERVER_PROTOCOL",
			format: [
				{name: "protoVersion", type: "UInt8"},
				{name: "updateType",   type: "protocol", loop: 1}
			],
		},
		104: {
			name: "ADMIN_PACKET_SERVER_WELCOME",
			format: [
				{name: "name",      type: "utf8"},
				{name: "version",   type: "utf8"},
				{name: "dedicated", type: "bool"},
				{name: "mapName",   type: "utf8"},
				{name: "seed",      type: "UInt32LE"},
				{name: "landscape", type: "UInt8"},
				{name: "startYear", type: "UInt32LE"},
				{name: "mapWidth",  type: "UInt16LE"},
				{name: "mapHeight", type: "UInt16LE"}
			],
		},
		105: {
			name: "ADMIN_PACKET_SERVER_NEWGAME",
			format: [],
		},
		106: {
			name: "ADMIN_PACKET_SERVER_SHUTDOWN",
			format: [],
		},
		107: {
			name: "ADMIN_PACKET_SERVER_DATE",
			format: [
				{name: "date", type: "UInt32LE"}
			],
		},
		108: {
			name: "ADMIN_PACKET_SERVER_CLIENT_JOIN",
			format: [
				{name: "clientID", type: "UInt32LE"}
			],
		},
		109: {
			name: "ADMIN_PACKET_SERVER_CLIENT_INFO",
			format: [
				{name: "clientID",  type: "UInt32LE"},
				{name: "hostName",  type: "utf8"},
				{name: "name",      type: "utf8"},
				{name: "language",  type: "UInt8"},
				{name: "joinDate",  type: "UInt32LE"},
				{name: "companyId", type: "UInt8"}
			],
		},
		110: {
			name: "ADMIN_PACKET_SERVER_CLIENT_UPDATE",
			format: [
				{name: "clientId",  type: "UInt32LE"},
				{name: "name",      type: "utf8"},
				{name: "companyId", type: "UInt8"}
			],
		},
		111: {
			name: "ADMIN_PACKET_SERVER_CLIENT_QUIT",
			format: [
				{name: "clientId", type: "UInt32LE"}
			],
		},
		112: {
			name: "ADMIN_PACKET_SERVER_CLIENT_ERROR",
			format: [
				{name: "clientId",  type: "UInt32LE"},
				{name: "errorCode", type: "UInt8"}
			],
		},
		113: {
			name: "ADMIN_PACKET_SERVER_COMPANY_NEW",
			format: [
				{name: "companyId", type: "UInt8"}
			],
		},
		114: {
			name: "ADMIN_PACKET_SERVER_COMPANY_INFO",
			format: [
				{name: "companyId",  type: "UInt8"},
				{name: "name",       type: "utf8"},
				{name: "president",  type: "utf8"},
				{name: "colour",     type: "UInt8"},
				{name: "passworded", type: "bool"},
				{name: "startYear",  type: "UInt32LE"},
				{name: "ai",         type: "bool"}
			],
		},
		115: {
			name: "ADMIN_PACKET_SERVER_COMPANY_UPDATE",
			format: [
				{name: "companyId",    type: "UInt8"},
				{name: "name",         type: "utf8"},
				{name: "president",    type: "utf8"},
				{name: "colour",       type: "UInt8"},
				{name: "passworded",   type: "bool"},
				{name: "bankrupcy",    type: "UInt8"},
				{name: "shareholder1", type: "UInt8"},
				{name: "shareholder2", type: "UInt8"},
				{name: "shareholder3", type: "UInt8"},
				{name: "shareholder4", type: "UInt8"},
			],
		},
		116: {
			name: "ADMIN_PACKET_SERVER_COMPANY_REMOVE",
			format: [
				{name: "companyId", type: "UInt8"},
				{name: "reason",    type: "UInt8"}
			],
		},
		117: {
			name: "ADMIN_PACKET_SERVER_COMPANY_ECONOMY",
			format: [
				{name: "companyId",    type: "UInt8"},
				{name: "money",        type: "UInt64LE"},
				{name: "currentLoan",  type: "Int64LE"},
				{name: "income",       type: "Int64LE"},
				{name: "cargo1",       type: "Int64LE"},
				{name: "value1",       type: "Int64LE"},
				{name: "performance1", type: "Int64LE"},
				{name: "cargo2",       type: "Int64LE"},
				{name: "value2",       type: "Int64LE"},
				{name: "performance2", type: "Int64LE"},
			],
		},
		118: {
			name: "ADMIN_PACKET_SERVER_COMPANY_STATS",
			format: [
				{name: "companyId",     type: "UInt8"},
				{name: "trains",        type: "UInt16LE"},
				{name: "lorrys",        type: "UInt16LE"},
				{name: "busses",        type: "UInt16LE"},
				{name: "planes",        type: "UInt16LE"},
				{name: "ships",         type: "UInt16LE"},
				{name: "trainStations", type: "UInt16LE"},
				{name: "lorryStations", type: "UInt16LE"},
				{name: "busStations",   type: "UInt16LE"},
				{name: "airports",      type: "UInt16LE"},
				{name: "harbers",       type: "UInt16LE"},
			],
		},
		119: {
			name: "ADMIN_PACKET_SERVER_CHAT",
			format: [
				{name: "action",   type: "UInt8"},
				{name: "destType", type: "UInt8"},
				{name: "clientId", type: "UInt32LE"},
				{name: "message",  type: "utf8"},
				{name: "data",     type: "UInt64LE"}
			],
		},
		120: {
			name: "ADMIN_PACKET_SERVER_RCON",
			format: [
				{name: "colour", type: "UInt16LE"},
				{name: "result", type: "utf8"}
			],
		},
		121: {
			name: "ADMIN_PACKET_SERVER_CONSOLE",
			format: [
				{name: "origin",  type: "utf8"},
				{name: "message", type: "utf8"}
			],
		},
		122: {
			name: "ADMIN_PACKET_SERVER_CMD_NAMES",
			format: [
				{name: "cmdNames", type: "cmdNames"}
			],
		},
		123: {
			name: "ADMIN_PACKET_SERVER_CMD_LOGGING",
			format: [
				{name: "clientId",  type: "UInt32LE"},
				{name: "companyId", type: "UInt8"},
				{name: "commandId", type: "UInt16LE"},
				{name: "p1",        type: "UInt32LE"},
				{name: "p2",        type: "UInt32LE"},
				{name: "tile",      type: "UInt64LE"},
				{name: "text",      type: "utf8"},
				{name: "frame",     type: "UInt32LE"}
			],
		},
		124: {
			name: "ADMIN_PACKET_SERVER_GAMESCRIPT",
			format: [
				{name: "json", type: "utf8"}
			],
		},
	},

	// Status of an admin
	// Source: src/network/core/tcp_admin.h
	AdminStatus: {
		ADMIN_STATUS_INACTIVE: 0, // The admin is not connected nor active.
		ADMIN_STATUS_ACTIVE:   1, // The admin is active.
		// ADMIN_STATUS_END:     2,
	},

	// Update types an admin can register a frequency for
	// Source: src/network/core/tcp_admin.h
	AdminUpdateType: {
		ADMIN_UPDATE_DATE:            0, // Updates about the date of the game.
		ADMIN_UPDATE_CLIENT_INFO:     1, // Updates about the information of clients.
		ADMIN_UPDATE_COMPANY_INFO:    2, // Updates about the generic information of companies.
		ADMIN_UPDATE_COMPANY_ECONOMY: 3, // Updates about the economy of companies.
		ADMIN_UPDATE_COMPANY_STATS:   4, // Updates about the statistics of companies.
		ADMIN_UPDATE_CHAT:            5, // The admin would like to have chat messages.
		ADMIN_UPDATE_CONSOLE:         6, // The admin would like to have console messages.
		ADMIN_UPDATE_CMD_NAMES:       7, // The admin would like a list of all DoCommand names.
		ADMIN_UPDATE_CMD_LOGGING:     8, // The admin would like to have DoCommand information.
		ADMIN_UPDATE_GAMESCRIPT:      9, // The admin would like to have gamescript messages.
		// ADMIN_UPDATE_END:            10,
	},

	// Update frequencies an admin can register.
	// Source: src/network/core/tcp_admin.h
	AdminUpdateFrequency: {
		ADMIN_FREQUENCY_POLL:      0x01, // The admin can poll this.
		ADMIN_FREQUENCY_DAILY:     0x02, // The admin gets information about this on a daily basis.
		ADMIN_FREQUENCY_WEEKLY:    0x04, // The admin gets information about this on a weekly basis.
		ADMIN_FREQUENCY_MONTHLY:   0x08, // The admin gets information about this on a monthly basis.
		ADMIN_FREQUENCY_QUARTERLY: 0x10, // The admin gets information about this on a quarterly basis.
		ADMIN_FREQUENCY_ANUALLY:   0x20, // The admin gets information about this on a yearly basis.
		ADMIN_FREQUENCY_AUTOMATIC: 0x40, // The admin gets information about this when it changes.
	},

	// Reasons for removing a company - communicated to admins.
	// Source: src/network/core/tcp_admin.h
	AdminCompanyRemoveReason: {
		ADMIN_CRR_MANUAL:    0, // The company is manually removed.
		ADMIN_CRR_AUTOCLEAN: 1, // The company is removed due to autoclean.
		ADMIN_CRR_BANKRUPT:  2, // The company went belly-up.
	},

	Colour: {
		COLOUR_DARK_BLUE:  0,
		COLOUR_PALE_GREEN: 1,
		COLOUR_PINK:       2,
		COLOUR_YELLOW:     3,
		COLOUR_RED:        4,
		COLOUR_LIGHT_BLUE: 5,
		COLOUR_GREEN:      6,
		COLOUR_DARK_GREEN: 7,
		COLOUR_BLUE:       8,
		COLOUR_CREAM:      9,
		COLOUR_MAUVE:     10,
		COLOUR_PURPLE:    11,
		COLOUR_ORANGE:    12,
		COLOUR_BROWN:     13,
		COLOUR_GREY:      14,
		COLOUR_WHITE:     15,
		// COLOUR_END:       16,
		COLOUR_INVALID:   0xFF,
	},

	DestType: {
		DESTTYPE_BROADCAST: 0,
		DESTTYPE_TEAM:      1,
		DESTTYPE_CLIENT:    2,
	},

	Landscape: {
		LANDSCAPE_TEMPERATE: 0,
		LANDSCAPE_ARTIC:     1,
		LANDSCAPE_TROPIC:    2,
		LANDSCAPE_TOYLAND:   3,
		// NUM_LANDSCAPE:       4,
	},

	NetworkAction: {
		NETWORK_ACTION_JOIN:              0,
		NETWORK_ACTION_LEAVE:             1,
		NETWORK_ACTION_SERVER_MESSAGE:    2,
		NETWORK_ACTION_CHAT:              3,
		NETWORK_ACTION_CHAT_COMPANY:      4,
		NETWORK_ACTION_CHAT_CLIENT:       5,
		NETWORK_ACTION_CHAT_MONEY:        6,
		NETWORK_ACTION_NAME_CHANGE:       7,
		NETWORK_ACTION_COMPANY_SPECTATOR: 8,
		NETWORK_ACTION_COMPANY_JOIN:      9,
		NETWORK_ACTION_COMPANY_NEW:      10,
	},

	NetworkErrorCode: {
		// Signals from clients
		NETWORK_ERROR_DESYNC:            1,
		NETWORK_ERROR_SAVEGAME_FAILED:   2,
		NETWORK_ERROR_CONNECTION_LOST:   3,
		NETWORK_ERROR_ILLEGAL_PACKET:    4,
		NETWORK_ERROR_NEWGRF_MISMATCH:   5,

		// Signals from servers
		NETWORK_ERROR_NOT_AUTHORIZED:    6,
		NETWORK_ERROR_NOT_EXPECTED:      7,
		NETWORK_ERROR_WRONG_REVISION:    8,
		NETWORK_ERROR_NAME_IN_USE:       9,
		NETWORK_ERROR_WRONG_PASSWORD:   10,
		NETWORK_ERROR_COMPANY_MISMATCH: 11,
		NETWORK_ERROR_KICKED:           12,
		NETWORK_ERROR_CHEATER:          13,
		NETWORK_ERROR_FULL:             14
	},

	// Language ids for server_lang and client_lang.
	// Source: src/network/network_internal.h
	NetworkLanguage: {
		NETLANG_ANY:          0,
		NETLANG_ENGLISH:      1,
		NETLANG_GERMAN:       2,
		NETLANG_FRENCH:       3,
		NETLANG_BRAZILIAN:    4,
		NETLANG_BULGARIAN:    5,
		NETLANG_CHINESE:      6,
		NETLANG_CZECH:        7,
		NETLANG_DANISH:       8,
		NETLANG_DUTCH:        9,
		NETLANG_ESPERANTO:   10,
		NETLANG_FINNISH:     11,
		NETLANG_HUNGARIAN:   12,
		NETLANG_ICELANDIC:   13,
		NETLANG_ITALIAN:     14,
		NETLANG_JAPANESE:    15,
		NETLANG_KOREAN:      16,
		NETLANG_LITHUANIAN:  17,
		NETLANG_NORWEGIAN:   18,
		NETLANG_POLISH:      19,
		NETLANG_PORTUGUESE:  20,
		NETLANG_ROMANIAN:    21,
		NETLANG_RUSSIAN:     22,
		NETLANG_SLOVAK:      23,
		NETLANG_SLOVENIAN:   24,
		NETLANG_SPANISH:     25,
		NETLANG_SWEDISCH:    26,
		NETLANG_TURKISCH:    27,
		NETLANG_UKRAINIAN:   28,
		NETLANG_AFRIKAANS:   29,
		NETLANG_CROATIAN:    30,
		NETLANG_CATALAN:     31,
		NETLANG_ESTONIAN:    32,
		NETLANG_GALICIAN:    33,
		NETLANG_GREEK:       34,
		NETLANG_LATVIAN:     35,
		// NETLANG_COUNT:       36,
	},
	VehicleType: {
		NETWORK_VEH_TRAIN: 0,
		NETWORK_VEH_LORRY: 1,
		NETWORK_VEH_BUS:   2,
		NETWORK_VEH_PLANE: 3,
		NETWORK_VEH_SHIP:  4,
	}
};
