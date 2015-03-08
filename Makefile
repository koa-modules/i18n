TESTS = test/*.js
REPORTER = spec
TIMEOUT = 5000
MOCHA_OPTS =

MOCHA = ./node_modules/.bin/_mocha

IOJS_ENV ?= test

BIN = iojs

ifeq ($(findstring io.js, $(shell which node)),)
	BIN = node
endif

ifeq (node, $(BIN))
	FLAGS = --harmony
endif

node_modules:
	@npm install

test: node_modules
	@NODE_ENV=$(IOJS_ENV) $(BIN) $(FLAGS) \
		$(MOCHA) \
		--harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

.PHONY: test
