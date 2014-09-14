describe("Calculator", function() {

	var calc;

	// Test setup
	beforeEach(function() {
		calc = new Calculator();
	});

	// test add function
	it('it should be able to add 1 and 1', function() {

		expect(calc.add(1, 1)).toBe(2);
	});

	// test divide function
	it('it should divide 6 by 2', function() {

		expect(calc.divide(6, 2)).toBe(3);
	});

	// test divide function
	it('it should divide a rational number', function() {

		expect(calc.divide(1, 3)).toBeBetween(0.3, 0.34);
	});
});