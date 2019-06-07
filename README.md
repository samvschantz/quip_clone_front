# Quips Against People
## A multi-player game based on [Cards Against Humanity]() and [Quiplash](https://jackboxgames.com/project/quiplash/)

The game will ask a prompt to all players but one. Once all players have answered (or time has run out) the player who has not played will judge the winning card. This continues until one person wins seven times!

The game uses ReactJS on the front end to write to a firebase real-time database.

Deployed at [https://quip-3171f.firebaseapp.com/](https://quip-3171f.firebaseapp.com/).

## Screenshots

![Waiting room (mobile screenshot)](https://github.com/samvschantz/quip_clone_front/blob/master/docs/phone_players.png)

![One card played](https://github.com/samvschantz/quip_clone_front/blob/master/docs/played1.png)

![Judge choosing a card](https://github.com/samvschantz/quip_clone_front/blob/master/docs/choose_card.png)

## Running the project from Github
1. Clone the repository.
2. In your terminal window use command "npm install" to install all dependencies.
3. Create a firebase realtime database and copy the identification information into a .env file in the root of the project.
4. In the terminal use command "npm run start" to run the app.  
5. The app will open automatically in your browser.
6. Open two other tabs in order to test (minimum of 3 players needed).

## Creator
[Sam Schantz](https://github.com/samvschantz)