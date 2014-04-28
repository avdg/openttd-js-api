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
				while (year % 4 == 0) {
					year = Math.floor(Math.random() * 9999);
				}

				assert.deepEqual([generics.daysInMonth(1, year), year], [28, year]);
			});
			it('Should return 29 days for february if year is leap', function() {
				var year = 1;
				while (year % 4 != 0 || year % 100 == 0) {
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
});