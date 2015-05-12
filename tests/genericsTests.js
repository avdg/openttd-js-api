"use strict";

var assert = require('assert');
var generics = require('../lib/generics');

describe('Generics (internals)', function() {

	describe('Function reverseObject', function() {
		it('should reverse keys and values', function() {
			assert.deepEqual(
				generics.getInversedObject({foo: 'bar'}),
				{bar: 'foo'}
			);
		});
	});

	describe('Date Handling', function() {
		describe('Function isLeapYear', function() {
			it('Should return false when number is not divisible by 4', function() {
				assert.equal(generics.isLeapYear(2014), false);
			});
			it('Should return true when number is divisible by 4 and not by 100',
				function() {
					assert.equal(generics.isLeapYear(2012), true);
				}
			);
			it('Should return true when number is divisible by 4 and not by 100',
				function() {
					assert.equal(generics.isLeapYear(2016), true);
				}
			);
			it('Should return false when number is divisible by 100 and not by 400',
				function() {
					assert.equal(generics.isLeapYear(2100), false);
				}
			);
			it('Should return true when number is divisible by 400', function() {
				assert.equal(generics.isLeapYear(2000), true);
			});
		});

		describe('Function daysInMonth', function() {
			it('Note: months starts from 0, so 0 is january, 11 is december',
				function() {}
			);
			it('Should return 31 days for january for any year', function() {
				assert.equal(generics.daysInMonth(0, 2014), 31);
			});
			it('Should return 31 days for march for any year', function() {
				assert.equal(generics.daysInMonth(2, 2014), 31);
			});
			it('Should return 30 days for april for any year', function() {
				assert.equal(generics.daysInMonth(3, 2014), 30);
			});
			it('Should return 31 days for december for any year', function() {
				assert.equal(generics.daysInMonth(11, 2014), 31);
			});
			it('Should return 28 days for february if year is not leap', function() {
				assert.equal(generics.daysInMonth(1, 2014), 28);
			});
			it('Should return 29 days for february if year is leap', function() {
				assert.equal(generics.daysInMonth(1, 2012), 29);
			});
		});

		describe('Function daysInMonth (random years - Additional tests)', function() {
			it('Should return 31 days for january for any year', function() {
				var year = Math.floor(Math.random() * 9999);

				assert.deepEqual([generics.daysInMonth(0, year), year], [31, year]);
			});
			it('Should return 31 days for march for any year', function() {
				var year = Math.floor(Math.random() * 9999);

				assert.deepEqual([generics.daysInMonth(2, year), year], [31, year]);
			});
			it('Should return 30 days for april for any year', function() {
				var year = Math.floor(Math.random() * 9999);

				assert.deepEqual([generics.daysInMonth(3, year), year], [30, year]);
			});
			it('Should return 31 days for december for any year', function() {
				var year = Math.floor(Math.random() * 9999);

				assert.deepEqual([generics.daysInMonth(11, year), year], [31, year]);
			});
			it('Should return 28 days for february if year is not leap', function() {
				var year = 0;
				while (year % 4 === 0) {
					year = Math.floor(Math.random() * 9999);
				}

				assert.deepEqual([generics.daysInMonth(1, year), year], [28, year]);
			});
			it('Should return 29 days for february if year is leap', function() {
				var year = 1;
				while (year % 4 !== 0 || year % 100 === 0) {
					year = Math.floor(Math.random() * 9999);
				}

				assert.deepEqual([generics.daysInMonth(1, year), year], [29, year]);
			});
		});

		describe('Function getQuarter', function () {
			it ('Should return the right quarter for each month', function() {
				var months = [
					0, // Jan
					0, // Feb
					0, // Mar
					1, // Apr
					1, // May
					1, // Jun
					2, // Jul
					2, // Aug
					2, // Sep
					3, // Oct
					3, // Nov
					3  // Dec
				];

				for (var i = 0; i < 12; i++) {
					assert.deepEqual([generics.getQuarter(i), i], [months[i], i]);
				}
			});
		});

		describe('Function gameDateToDate', function() {
			it('Should have consistent output to random dates', function() {
				var table = [
					[0,       {year: 0,    month:  0, day:  1, quarter: 0}],
					[1234567, {year: 3380, month:  1, day: 17, quarter: 0}],
					[654321,  {year: 1791, month:  5, day: 21, quarter: 1}]
				];

				for (var i = 0; i < table.length; i++) {
					assert.deepEqual(
						generics.gameDateToDate(table[i][0]),
						table[i][1]
					);
				}
			});
		});
	});

	describe('Networking', function () {
		describe('Type Table', function () {
			describe('Notes about type testing:', function() {
				it('- Make sure to test byte ordering', function() {});
				it('- Make sure to test special values', function() {});
				it('- Make sure to test (or let it fail) for cases of reading/writing outside the expected buffer',
					function() {}
				);
			});

			describe('Send', function () {
				it('Should be able to create UInt8 buffers', function() {
					var buffer = generics.typeTableSend.uint8(8);

					assert.equal(buffer.length, 1);
					assert.deepEqual(buffer, new Buffer([8]));
				});

				it('Should be able to create Int8 buffers', function() {
					var buffer = generics.typeTableSend.int8(-8);

					assert.equal(buffer.length, 1);
					assert.deepEqual(buffer, new Buffer([248 /* 0xF8 */]));
				});

				it('Should be able to create UInt16LE buffers', function() {
					var buffer = generics.typeTableSend.uint16le(0x7877);

					assert.equal(buffer.length, 2);
					assert.deepEqual(buffer, new Buffer([0x77, 0x78]));
				});

				it('Should be able to create UInt16BE buffers', function() {
					var buffer = generics.typeTableSend.uint16be(0x7877);

					assert.equal(buffer.length, 2);
					assert.deepEqual(buffer, new Buffer([0x78, 0x77]));
				});

				it('Should be able to create Int16LE buffers', function() {
					var buffer = generics.typeTableSend.int16le(-0x77);

					assert.equal(buffer.length, 2);
					assert.deepEqual(buffer, new Buffer([0x89, 0xff]));
				});

				it('Should be able to create Int16BE buffers', function() {
					var buffer = generics.typeTableSend.int16be(-0x77);

					assert.equal(buffer.length, 2);
					assert.deepEqual(buffer, new Buffer([0xff, 0x89]));
				});

				it('Should be able to create UInt32LE buffers', function() {
					var buffer = generics.typeTableSend.uint32le(0x77767574);

					assert.equal(buffer.length, 4);
					assert.deepEqual(buffer, new Buffer([0x74, 0x75, 0x76, 0x77]));
				});

				it('Should be able to create UInt32BE buffers', function() {
					var buffer = generics.typeTableSend.uint32be(0x77767574);

					assert.equal(buffer.length, 4);
					assert.deepEqual(buffer, new Buffer([0x77, 0x76, 0x75, 0x74]));
				});

				it('Should be able to create Int32LE buffers', function() {
					var buffer = generics.typeTableSend.int32le(-0x777675);

					assert.equal(buffer.length, 4);
					assert.deepEqual(buffer, new Buffer([0x8b, 0x89, 0x88, 0xff]));
				});

				it('Should be able to create Int32BE buffers', function() {
					var buffer = generics.typeTableSend.int32be(-0x777675);

					assert.equal(buffer.length, 4);
					assert.deepEqual(buffer, new Buffer([0xff, 0x88, 0x89, 0x8b]));
				});

				it('Should be able to create floatLE buffers', function() {
					var buffer = generics.typeTableSend.floatle(0.3);

					assert.equal(buffer.length, 4);
					assert.equal(buffer.readFloatLE(0) > 0.299, true);
					assert.equal(buffer.readFloatLE(0) < 0.301, true);
				});

				it('Should be able to create floatBE buffers',  function() {
					var buffer = generics.typeTableSend.floatbe(0.3);

					assert.equal(buffer.length, 4);
					assert.equal(buffer.readFloatBE(0) > 0.299, true);
					assert.equal(buffer.readFloatBE(0) < 0.301, true);
				});

				it('Should be able to create doubleLE buffers', function() {
					var buffer = generics.typeTableSend.doublele(0.3);

					assert.equal(buffer.length, 8);
					assert.equal(buffer.readDoubleLE(0) > 0.29999, true);
					assert.equal(buffer.readDoubleLE(0) < 0.30001, true);
				});

				it('Should be able to create doubleBE buffers', function() {
					var buffer = generics.typeTableSend.doublebe(0.3);

					assert.equal(buffer.length, 8);
					assert.equal(buffer.readDoubleBE(0) > 0.29999, true);
					assert.equal(buffer.readDoubleBE(0) < 0.30001, true);
				});

				it('Should be able to create bool buffers', function() {
					var buffer = generics.typeTableSend.bool(true);

					assert.equal(buffer.length, 1);
					assert.deepEqual(buffer, new Buffer([0x01]));
				});

				it('Should be able to create utf8 buffers', function() {
					var buffer = generics.typeTableSend.utf8('Test');

					assert.equal(buffer.length, 5);
					assert.deepEqual(buffer, new Buffer([0x54, 0x65, 0x73, 0x74, 0x00]));
				});

				it('Should not be able to create malicious utf8 buffers containing null chars', function() {
					var buffer = generics.typeTableSend.utf8('\u0000Te\u0000st');

					assert.equal(buffer.length, 5);
					assert.deepEqual(buffer, new Buffer([0x54, 0x65, 0x73, 0x74, 0x00]));
				});
			});

			describe('Receive', function () {
				it ('Note: returns an array of 2 elements with format [output, buffer length]',
					function() {}
				);

				it ('Should be able to read boolean buffers', function() {
					var output = generics.typeTableReceive.bool(new Buffer([0x00], 'hex'), 0);

					assert.deepEqual(output, [false, 1]);
				});

				it('Should be able to read UInt8 buffers', function() {
					var output = generics.typeTableReceive.uint8(new Buffer([0x88], 'hex'), 0);

					assert.deepEqual(output, [0x88, 1]);
				});

				it('Should be able to read Int8 buffers', function() {
					var output = generics.typeTableReceive.int8(new Buffer([0x88], 'hex'), 0);

					assert.deepEqual(output, [-0x78, 1]);
				});

				it('Should be able to read UInt16BE buffers', function() {
					var output = generics.typeTableReceive.uint16be(new Buffer([0x88, 0x87]), 0);

					assert.deepEqual(output, [0x8887, 2]);
				});

				it('Should be able to read UInt16LE buffers', function() {
					var output = generics.typeTableReceive.uint16le(new Buffer([0x88, 0x87]), 0);

					assert.deepEqual(output, [0x8788, 2]);
				});

				it('Should be able to read Int16BE buffers', function() {
					var output = generics.typeTableReceive.int16be(new Buffer([0x88, 0x87]), 0);

					assert.deepEqual(output, [-0x7779, 2]);
				});

				it('Should be able to read Int16LE buffers', function() {
					var output = generics.typeTableReceive.int16le(new Buffer([0x88, 0x87]), 0);

					assert.deepEqual(output, [-0x7878, 2]);
				});

				it('Should be able to read UInt32BE buffers', function() {
					var output = generics.typeTableReceive.uint32be(new Buffer([0x88, 0x87, 0x86, 0x85]), 0);

					assert.deepEqual(output, [0x88878685, 4]);
				});

				it('Should be able to read UInt32LE buffers', function() {
					var output = generics.typeTableReceive.uint32le(new Buffer([0x88, 0x87, 0x86, 0x85]), 0);

					assert.deepEqual(output, [0x85868788, 4]);
				});

				it('Should be able to read Int32BE buffers', function() {
					var output = generics.typeTableReceive.int32be(new Buffer([0x88, 0x87, 0x86, 0x85]), 0);

					assert.deepEqual(output, [-0x7778797b, 4]);
				});

				it('Should be able to read Int32LE buffers', function() {
					var output = generics.typeTableReceive.int32le(new Buffer([0x88, 0x87, 0x86, 0x85]), 0);

					assert.deepEqual(output, [-0x7a797878, 4]);
				});

				it('Should be able to read floatBE buffers', function() {
					var buffer = new Buffer(4);
					buffer.writeFloatBE(0.3, 0);

					var output = generics.typeTableReceive.floatbe(buffer, 0);

					assert.equal(output[0] > 0.299, true);
					assert.equal(output[0] < 0.301, true);
					assert.equal(output[1], 4);
				});

				it('Should be able to read floatLE buffers', function() {
					var buffer = new Buffer(4);
					buffer.writeFloatLE(0.3, 0);

					var output = generics.typeTableReceive.floatle(buffer, 0);

					assert.equal(output[0] > 0.299, true);
					assert.equal(output[0] < 0.301, true);
					assert.equal(output[1], 4);
				});

				it('Should be able to read doubleBE buffers', function() {
					var buffer = new Buffer(8);
					buffer.writeDoubleBE(0.3, 0);

					var output = generics.typeTableReceive.doublebe(buffer, 0);

					assert.equal(output[0] > 0.29999, true);
					assert.equal(output[0] < 0.30001, true);
					assert.equal(output[1], 8);
				});

				it('Should be able to read doubleLE buffers', function() {
					var buffer = new Buffer(8);
					buffer.writeDoubleLE(0.3, 0);

					var output = generics.typeTableReceive.doublele(buffer, 0);

					assert.equal(output[0] > 0.29999, true);
					assert.equal(output[0] < 0.30001, true);
					assert.equal(output[1], 8);
				});

				it('Should be able to read utf8 buffers', function() {
					var output = generics.typeTableReceive.utf8(new Buffer('Test\u0000'), 0);

					assert.deepEqual(output, ['Test', 5]);
				});

				it('Should be able to read empty utf8 buffers', function() {
					var output = generics.typeTableReceive.utf8(new Buffer([0x00]), 0);

					assert.deepEqual(output, ['', 1]);
				});

				it('Should not try to read utf8 buffers beyond buffer size', function() {

					try {
						var output = generics.typeTableReceive.utf8(new Buffer([0x03, 0x02, 0x01]), 0);

						assert.equal(true, false); // Expected throw not throwen
					} catch (e) {
						assert.equal(e instanceof Error, true);
						assert.equal(e.message, 'Out of bounce');
					}
				});

				it('Should be able to read UInt64BE buffers');
				it('Should be able to read UInt64LE buffers');
				it('Should be able to read Int64BE buffers');
				it('Should be able to read Int64LE buffers');

				// TODO There are no plans for these buffers if they might stay or not
				it('Should be able to read protocol buffers');
				it('Should be able to read cmdnames buffers');
			});
		});
	});
});