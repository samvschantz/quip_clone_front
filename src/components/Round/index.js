import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound] = useState(false);
    const [judging, startJudging] = useState(false); 
    const [displayPrompt, setTextDisplay] = useState('');


	  const user          = props.user;
    const gameId        = props.gameId;
    const users         = props.users;
    const turn 			    = props.turn;
    const playersTurn   = props.playersTurn;
    const userInfo      = users[user];
    const playerNames   = Object.keys(users);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');
    const readyRef      = dbReference.ref('games/' + gameId + '/promptReady');
    const cardsRef      = dbReference.ref('games/' + gameId + '/gameState/cards');
    const userCardsRef  = dbReference.ref('games/' + gameId + '/gameState/cards/' + user);
    // const apiUrl        = 'https://crhallberg.com/cah';

    useEffect(() => {
      gameListeners();
      setPrompt();      
    }, [])

    const setPrompt = () => {
      if(users[user].gameOwner){
        let promptIndex = Math.floor(Math.random() * Prompts.length);
        let Prompt = Prompts[promptIndex].text;
        Prompts.splice(promptIndex, 1);
        gameStateRef.update({
          prompt: Prompt
        })
      }
    }

    const showPrompt = () => {
      gameStateRef.once('value')
        .then((snapshot) => {
          setTextDisplay(snapshot.val().prompt);
        })
    }

    const readyUp = () => {
      console.log('got here');
      readyRef.once('value')
        .then((snapshot) => { because
          if(Object.keys(snapshot.val()).length === playerNames.length){
            showPrompt();
          }
        })
    }

    const gameListeners = () => {
      readyRef.on('child_added', readyUp);
      readyRef.update({
        [user]: true
      })
    }

    return (
        <div>
	       {
          !roundDone ?
            !judging ?    
              <div>
                <h1>{displayPrompt}</h1>
                {
                  playersTurn !== user ? 
                  <div>
                    <input id='card-input' type='text' placeholder='Fill in the blank' /> 
                    <button >Play</button>
                    <button >Edit</button>
                  </div>
                  : 
                  <p>You're judging!</p>
                }
               {
                  playersTurn !== user ? <p>is judging this round!</p> : ''
                }
                <p>cards have been played.</p>
              </div>
            :
              <div>

              </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} playersTurn={playersTurn}/>
          }
        </div>
    )
}

export default withFirebase(Round);