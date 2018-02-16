const GoogleAssistant = require('google-assistant');
const readline        = require('readline');
const path            = require('path');
const fs              = require('fs');
const blacklistFile   = 'blacklist.txt';
const adminFile       = 'admins.txt';

// Config File for Google Assistant oAuth
const config = {
    auth: {
            keyFilePath: path.resolve(__dirname, '../secret.json'),
            // where you want the tokens to be saved
            // will create the directory if not already there
            savedTokensPath: path.resolve(__dirname, '../tokens.json'),
        },
        // this param is optional, but all options will be shown
        conversation: {
            lang: 'en-US', // defaults to en-US, but try other ones, it's fun!
        },
};

// Create Google Assistant
const assistant = new GoogleAssistant(config.auth);  
assistant.on('ready', () => {})
         .on('error', (error) => {
            console.log('Assistant Error:', error);
        });
    

let blacklist = processList(blacklistFile);
let admins    = processList(adminFile);

module.exports = function(robot) {

        robot.hear(/^blacklist add (.*)/i, (res) => {
            if(admins.indexOf(res.message.user.name) < 0) {
                res.reply(`I'm afraid I can't let you do that.`);
                return;
            }

            let input = res.match[1];
            blacklist = addToList(blacklistFile, input, blacklist);
        });

        robot.hear(/^blacklist remove (.*)/i, (res) => {
            if(admins.indexOf(res.message.user.name) < 0) {
                res.reply(`I'm afraid I can't let you do that.`);
                return;
            }

            let input = res.match[1];
            blacklist = removeFromList(blacklistFile, input, blacklist);
        });

        robot.hear(/^admins add (.*)/i, (res) => {
            if(admins.indexOf(res.message.user.name) < 0) {
                res.reply(`I'm afraid I can't let you do that.`);
                return;
            }

            let input = res.match[1];
            admins    = addToList(adminFile, input, admins);
        });

        robot.hear(/^admins remove (.*)/i, (res) => {
            if(admins.indexOf(res.message.user.name) < 0) {
                res.reply(`I'm afraid I can't let you do that.`);
                return;
            }

            let input = res.match[1];
            admins    = removeFromList(adminFile, input, admins);
        });
           
        robot.hear(/^blacklist list/i, (res) => {
            let response = blacklist.join('\n');
            res.reply(`Black Listed Words: \n${response}`);
        });

        robot.hear(/^admins list/i, (res) => {
            let response = admins.join('\n');
            res.reply(`Admin List: \n${response}`);
        });

        // Google Assitant Wake Word
        robot.hear(/^google (.*)/i, (res) => {
            let input = res.match[1].toLowerCase();
            for(w of blacklist) {
                if(input.indexOf(w) >= 0) {
                    res.reply(`I'm afraid I can't let you do that.`);
                    return;
                }
            }
            config.conversation.textQuery = res.match[1];

            assistant.start(config.conversation, (conversation) => {
                conversation
                    .on('response', text => {res.reply(text)})
                    // once the conversation is ended, see if we need to follow up
                    .on('ended', (error, continueConversation) => {
                        if (error) {
                            console.log('Conversation Ended Error:', error);
                        } else if (continueConversation) {
                            
                        } else {
                            conversation.end();
                        }
                    })
                // catch any errors
                .on('error', (error) => {
                    console.log('Conversation Error:', error);
                });
            });
        });
}

/*************************************/
/********** HELPER FUNCTIONS ******* */
/*************************************/


/**
 * This function will remove words from the
 * Google Assistant Blacklist.
 * @param {string} file - file to remove from
 * @param {string} word - word to be removed
 */

 function removeFromList(file, word, list) {
    if(list.indexOf(word) < 0) return;
    
    list.splice(list.indexOf(word), 1);
    let lines = list.join('\n');
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
    if(list.indexOf(word) >= 0) return;
    list.push(word);
    let lines = list.join('\n');
    fs.writeFileSync(file, lines);
    return processList(file);
 }


/**
 * This function creates a Google Assistant
 * black list of words from a text file.
 * @param {string} inputFile - file containing the black list
 */
function processList(inputFile) {
    let list = []
    let readline  = require('readline'),
        instream  = fs.createReadStream(inputFile),
        outstream = new (require('stream'))(),
        rl        = readline.createInterface(instream, outstream);
     
    rl.on('line', function (line) {
        list.push(line);
    });
    
    return list;
}
