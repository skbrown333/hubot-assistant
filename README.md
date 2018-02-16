# Hubot-Assistant

Hubot Assistant uses Google's Assistant API to integrate an assistant into hubot.  This can be used to add an AI assistant to a slack channel.  

### Prerequisites

You will need a hubot to use this function with. You can download existing hubots or create your own here: https://hubot.github.com/.

You will also need to obtain a Google API oAuth JSON to authenticate your assistant - this can be obtained here: https://console.cloud.google.com/apis. This JSON needs to be copied into the secrets.json file located in node_modules/hubot-assistant/src.

The first time you run this it will open an authentication link and you will need to paste and enter the code into the console. 

You will also need to add hubot-assistant to the external-scripts of your hubot.

### Installing

```
npm install hubot-assistant
```

## Warnings

Some commands will send the assistant into a loop such as: 

```
google play mad libs
```

```
google tune my guitar
```

You can get out of this loop by saying:

```
google quit
```
(it could take a couple of tries).


In order to prevent this from happening you can blacklist certain words such as 

```
blacklist add play
blacklist remove play
blacklist list
```

Only admins have access to the blacklist and admin list. First time use you will need to add a slack username to the admins.txt located in node_modules/hubot-assistant/src.

```
admins add skbrown333
admins remove skbrown333
admins list
```

## Authors

* **Steffan Brown** - *Initial work* - (https://github.com/skbrown333/hubot-assistant)