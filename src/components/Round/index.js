import React, { useState } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]    = useState(false);
    const [displayPrompt, setDisplay] = useState('');

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


    const showPrompt = () => {
      gameStateRef.once('value')
        .then((snapshot) => {
          console.log(snapshot.val())
          console.log(snapshot.val().prompt)
          setDisplay(snapshot.val().prompt);
        })
    }

    if(!users[user].gameOwner){
      gameStateRef.on('child_changed', showPrompt);
    } else if(users[user].gameOwner && displayPrompt === ''){
      let promptIndex = Math.floor(Math.random() * Prompts.length);
      console.log(Prompts[promptIndex]);
      console.log(Prompts[promptIndex].text);
      let Prompt = Prompts[promptIndex].text;
      console.log(Prompts.length);
      Prompts.splice(promptIndex, 1);
      console.log(Prompts.length);
      gameStateRef.update({
        prompt: Prompt
      })
      setDisplay(Prompt);
    }

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