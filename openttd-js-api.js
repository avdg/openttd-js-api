"use strict";

var generics = require("./lib/generics.js");

module.exports = {
	adminport: require("./lib/openttd-adminport.js"),

	isLeapYear: generics.isLeapYear,
	daysInMonth: generics.daysInMonth,
	getQuarter: generics.getQuarter,
	gameDateToDate: generics.gameDateToDate,
};