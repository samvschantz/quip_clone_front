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
    const whosTurn 		  = props.whosTurn;
    const userInfo      = users[user];
    const playerNames   = Object.keys(users);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');
    const apiUrl        = 'https://crhallberg.com/cah';

    let promptIndex = Math.floor(Math.random() * Prompts.length);
    let Prompt = Prompts[promptIndex].text;
    Prompts.splice(promptIndex, 1);

    return (
        <div>
	       {!roundDone ?
          <div>
            <h1>{Prompt}</h1>
            <p>{whosTurn} is judging this round!</p>
          </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} whosTurn={whosTurn}/>
          }
        </div>
    )
}

export default withFirebase(Round);