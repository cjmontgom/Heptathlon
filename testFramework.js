let tests = []

function test(assertion, fn) {
	tests.push({ assertion, fn })
}

function run() {

	console.log("......................................................")
	console.log("Running the best testing framework you've ever seen...")
	console.log("......................................................")

	tests.forEach(test => {
		try {
			test.fn()
			console.log('✅', test.assertion)
		} catch (e) {
			console.log('❌', test.assertion)
			console.log(e.stack)
		}
	})
}

module.exports = { test, run }
