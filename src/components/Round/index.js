import React, { useState } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]  = useState(false);

	  const user          = props.user;
    const gameId        = props.gameId;
    const users         = props.users;
    const turn 			    = props.turn;
    const playersTurn   = props.playersTurn;
    const userInfo      = users[user];
    const playerNames   = Object.keys(users);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');
    const apiUrl        = 'https://crhallberg.com/cah';

    let displayPrompt = '';

    if(users[user].gameOwner && displayPrompt === ''){
      let promptIndex = Math.floor(Math.random() * Prompts.length);
      console.log(Prompts[promptIndex]);
      console.log(Prompts[promptIndex].text);
      let Prompt = Prompts[promptIndex].text;
      Prompts.splice(promptIndex, 1);
      gameStateRef.update({
        prompt: Prompt
      })
    }

    const showPrompt = () => {
      gameStateRef.once((snapshot) => {
        console.log(snapshot.val().prompt)
        displayPrompt = snapshot.val().prompt;
      })
    }

    gameStateRef.on('child_changed', showPrompt);

    return (
        <div>
	       {!roundDone ?
          <div>
            <h1>{displayPrompt}</h1>
            <p>{playersTurn} is judging this round!</p>
          </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} playersTurn={playersTurn}/>
          }
        </div>
    )
}

export default withFirebase(Round);