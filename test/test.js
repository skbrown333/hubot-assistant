const Helper = require('hubot-test-helper');
const chai = require('chai');
const expect = chai.expect;

let helper = new Helper('../src/assistant.js');

describe('class:assistant', () => {
	let room; 

	beforeEach(() => {
		room = helper.createRoom();
	});

	afterEach(() => {
		room.destroy();
	});

	it('should interact with blacklist', (done) => {
		room.user.say('bob', 'blacklist add word').then(() => {
			expect(room.messages[1][1]).to.equal("@bob I'm afraid I can't let you do that.");
			done();
		}).catch(done);
	});

	it('should interact with admins', (done) => {
		room.user.say('bob', 'admins add word').then(() => {
			expect(room.messages[1][1]).to.equal("@bob I'm afraid I can't let you do that.");
			done();
		}).catch(done);
	});

	it('should not blow up on google request', (done) => {
		room.user.say('bob', 'google tell me a joke').then(() => {
			done();
		});
	});
	
});