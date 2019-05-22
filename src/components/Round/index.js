import React, { useState } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]        = useState(false);
    const [promptChosen, choosePrompt]    = useState(false);
    const [displayPrompt, setTextDisplay] = useState('');
    const [displayPick, setPickDisplay]   = useState(''); 

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

    const showPrompt = (snapshot) => {
      setTextDisplay(snapshot.val());
    }

    gameStateRef.once('value')
      .then((snapshot) => {
        gameStateRef.on('child_changed', showPrompt);
      })
      .then(() => {
        if(users[user].gameOwner && !promptChosen){
          let promptIndex = Math.floor(Math.random() * Prompts.length);
          let Prompt = Prompts[promptIndex].text;
          Prompts.splice(promptIndex, 1);
          gameStateRef.update({
            prompt: Prompt
          })
          setTextDisplay(Prompt);
          choosePrompt(true);
        }
      })

    return (
        <div>
	       {
          !roundDone ?
          <div>
            <h1>{displayPrompt}</h1>
            {
              playersTurn !== user ? <input type='text' placeholder='Fill in the blank' /> : <p>You're judging!</p>
            }
           {
              playersTurn !== user ? <p>{playersTurn} is judging this round!</p> : ''
            }
          </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} playersTurn={playersTurn}/>
          }
        </div>
    )
}

export default withFirebase(Round);