TESTS = test/*.js
REPORTER = spec
TIMEOUT = 5000
MOCHA_OPTS =

node_modules:
	@npm install

test: node_modules
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

.PHONY: test
