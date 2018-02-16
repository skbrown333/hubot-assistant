# hubot-assistant

hubot-assistant is a chat bot built on the [Hubot][hubot] framework.

hubot-assistant uses Google Assistant API to integrate an assitant to a slack channel.

### Configuration
You will need a google API oAuth2 json which you can get from https://console.cloud.google.com/apis/. 

This json will nede to be copy and pasted into secret.json in order to work.

The first time you run this a link will be pasted into the console with an authentication link to authenticate the app.

## Use

Wake Word - google <br />
    ex. google tell me a joke. <br />
Black List - a list of words for google to ignore (blacklist.txt) <br />
    ex. play <br />
Admin List - a list of admins who can edit blaclist/admins <br />
