/**
 * assistant.js
 * This adds and runs a google assistant within hubot.
 *
 * @license MIT
 * @version 0.14
 * @author  Steffan Brown, https://github.com/skbrown333/hubot-assistant
 * @updated 2018-02-16
 */

const GoogleAssistant = require('google-assistant');
const path = require('path');
const secretPath = process.env.HUBOT_ASSISTANT_SECRET;
const tokenPath = process.env.HUBOT_ASSISTANT_TOKEN;
const REDIS_KEY = 'hubot-assistant';

// Config File for Google Assistant oAuth
const config = {
	auth: {
		keyFilePath: path.resolve(__dirname, secretPath),
		// where you want the tokens to be saved
		// will create the directory if not already there
		savedTokensPath: path.resolve(__dirname, tokenPath),
	},
	// this param is optional, but all options will be shown
	conversation: {
		lang: 'en-US', // defaults to en-US, but try other ones, it's fun!
	},
};

// Create Google Assistant
const assistant = new GoogleAssistant(config.auth);
assistant.on('ready', () => {});

module.exports = function (robot) {
	let hubotAssistant;
	let blacklist;
	let admins;
	let input;

	if( !getHubotAssistant().admins[0] ) {
		setHubotAssistant({ admins: [ process.env.HUBOT_DEFAULT_ADMIN ], blacklist: [] });
	}

	robot.hear(/^blacklist add (.*)/i, (res) => {
		input = res.match[1];
		hubotAssistant = getHubotAssistant(); 
		admins = hubotAssistant.admins;
		blacklist = hubotAssistant.blacklist;

		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		} 
		else if (blacklist.indexOf(input) >= 0) {
			res.reply(`[ ${input} ] is already blacklisted.`);
			return;
		} 
		else {
			res.reply(`Added [ ${input} ] to blacklist.`);
			blacklist.push(input);
			setHubotAssistant(hubotAssistant);
		}

	});

	robot.hear(/^blacklist remove (.*)/i, (res) => {
		input = res.match[1];
		hubotAssistant = getHubotAssistant(); 
		admins = hubotAssistant.admins;
		blacklist = hubotAssistant.blacklist;
		
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		} 
		else if (blacklist.indexOf(input) < 0) {
			res.reply(`[ ${input} ] is not blacklisted.`);
			return;
		} 
		else {
			res.reply(`Removed [ ${input} ] from blacklist.`);
			blacklist.splice(blacklist.indexOf(input), 1);
			setHubotAssistant(hubotAssistant);
		}
	});

	robot.hear(/^admins add (.*)/i, (res) => {
		input = res.match[1];
		hubotAssistant = getHubotAssistant(); 
		admins = hubotAssistant.admins;
		
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		} 
		else if (admins.indexOf(input) >= 0) {
			res.reply(`[ ${input} ] is already an admin.`);
			return;
		} 
		else {
			res.reply(`Added [ ${input} ] to admins.`);
			admins.push(input);
			setHubotAssistant(hubotAssistant);
		}
	});

	robot.hear(/^admins remove (.*)/i, (res) => {
		input = res.match[1];
		hubotAssistant = getHubotAssistant(); 
		admins = hubotAssistant.admins;
		
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		} 
		else if (admins.indexOf(input) >= 0) {
			res.reply(`[ ${input} ] is not an admin.`);
			return;
		} 
		else {
			res.reply(`Removed [ ${input} ] from admins.`);
			admins.splice(admins.indexOf(input, 1));
			setHubotAssistant(hubotAssistant);
		}
	});

	robot.hear(/^blacklist list/i, (res) => {
		hubotAssistant = getHubotAssistant(); 
		blacklist = hubotAssistant.blacklist;
		res.reply(`Blacklisted Words: \n${blacklist.join('\n')}`);

	});

	robot.hear(/^admins list/i, (res) => {
		hubotAssistant = getHubotAssistant(); 
		admins = hubotAssistant.admins;
		res.reply(`Admin List: \n${admins.join('\n')}`);
	});

	// Google Assitant Wake Word
	robot.hear(/^google (.*)/i, (res) => {
		const input = res.match[1].toLowerCase();
		hubotAssistant = getHubotAssistant(); 
		blacklist = hubotAssistant.blacklist;
		for (const w of blacklist) {
			if (input.indexOf(w) >= 0) {
				res.reply(`I'm afraid I can't let you do that. The word [ ${w} ] has bee blacklisted.`);
				return;
			}
		}
		config.conversation.textQuery = res.match[1];

		assistant.start(config.conversation, (conversation) => {
			conversation
				.on('response', (text) => { res.reply(text); })
			// once the conversation is ended, see if we need to follow up
				.on('ended', () => {
					conversation.end();
				});
		});
	});


	/** ********************************** */
	/** ******** HELPER FUNCTIONS ******** */
	/** ********************************** */

	function setHubotAssistant(hubotAssistant) {
		if(!hubotAssistant) return;
		return robot.brain.set(REDIS_KEY, hubotAssistant);
	}

	function getHubotAssistant() {
		if(!robot.brain.get(REDIS_KEY)) return { admins: [], blacklist : [] };
		return robot.brain.get(REDIS_KEY);
	}
};
