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
const fs = require('fs');

const blacklistFile = path.resolve(__dirname, 'blacklist.txt');
const adminFile = path.resolve(__dirname, 'admins.txt');
const secretPath = process.env.HUBOT_ASSISTANT_SECRET;
const tokenPath = process.env.HUBOT_ASSISTANT_TOKEN;

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

let blacklist = processList(blacklistFile);
let admins = processList(adminFile);

module.exports = function (robot) {
	robot.hear(/^blacklist add (.*)/i, (res) => {
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. you are not an admin.');
			return;
		}

		const input = res.match[1];
		blacklist = addToList(blacklistFile, input, blacklist);
	});

	robot.hear(/^blacklist remove (.*)/i, (res) => {
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		}

		const input = res.match[1];
		blacklist = removeFromList(blacklistFile, input, blacklist);
	});

	robot.hear(/^admins add (.*)/i, (res) => {
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		}

		const input = res.match[1];
		admins = addToList(adminFile, input, admins);
	});

	robot.hear(/^admins remove (.*)/i, (res) => {
		if (admins.indexOf(res.message.user.name) < 0) {
			res.reply('I\'m afraid I can\'t let you do that. You are not an admin.');
			return;
		}

		const input = res.match[1];
		admins = removeFromList(adminFile, input, admins);
	});

	robot.hear(/^blacklist list/i, (res) => {
		const response = blacklist.join('\n');
		res.reply(`Black Listed Words: \n${response}`);
	});

	robot.hear(/^admins list/i, (res) => {
		const response = admins.join('\n');
		res.reply(`Admin List: \n${response}`);
	});

	// Google Assitant Wake Word
	robot.hear(/^google (.*)/i, (res) => {
		const input = res.match[1].toLowerCase();
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
};

/** ********************************** */
/** ******** HELPER FUNCTIONS ******** */
/** ********************************** */

/**
 * This function will remove words from the
 * Google Assistant Blacklist.
 * @param {string} file - file to remove from
 * @param {string} word - word to be removed
 */

function removeFromList(file, word, list) {
	if (list.indexOf(word) < 0) return;

	list.splice(list.indexOf(word), 1);
	const lines = list.join('\n');
	fs.writeFileSync(file, lines);
	return processList(file);
}

/**
 * This function will add words to the Google
 * Assistant blacklist.
 * @param {string} file - file to append to
 * @param {string} word - word to be added to the blacklist
 */

function addToList(file, word, list) {
	if (list.indexOf(word) >= 0) return;
	list.push(word);
	const lines = list.join('\n');
	fs.writeFileSync(file, lines);
	return processList(file);
}

/**
 * This function creates a Google Assistant
 * black list of words from a text file.
 * @param {string} inputFile - file containing the black list
 */

function processList(inputFile) {
	const list = [];
	const readline = require('readline');
	const instream = fs.createReadStream(inputFile);
	const outstream = new (require('stream'))();
	const rl = readline.createInterface(instream, outstream);

	rl.on('line', (line) => {
		list.push(line);
	});

	return list;
}
