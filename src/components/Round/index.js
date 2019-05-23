import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]        = useState(false);
    const [promptChosen, choosePrompt]    = useState(false);
    const [displayPrompt, setTextDisplay] = useState('');
    const [cardToPlay, playCard]          = useState('');
    const [allReady, setReady]            = useState(false); 

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
    const userReadyRef  = dbReference.ref('games/' + gameId + '/gameState/promptReady/' + user);
    const cardsRef      = dbReference.ref('games/' + gameId + '/gameState/cards/' + user);
    const apiUrl        = 'https://crhallberg.com/cah';

    useEffect(() => {      
      gameStateListener();
    }, [])

    const showPrompt = () => {
      gameStateRef.once('value')
        .then((snapshot) => {
          setTextDisplay(snapshot.val().prompt)
        })
    }

    const gameStateListener = () => {
      readyRef.on('child_added', waitForAll);
      setPrompt();
    }

    const setPrompt = () => {
      console.log('setPrompt');
      if(users[user].gameOwner && !promptChosen){
        let promptIndex = Math.floor(Math.random() * Prompts.length);
        let Prompt = Prompts[promptIndex].text;
        Prompts.splice(promptIndex, 1);
        gameStateRef.update({
          prompt: Prompt
        })
      }
      onReady();
    }

    const waitForAll = (snapshot) => {
      readyRef.once('value')
        .then((snapshot) => {
          let readyStateObj = snapshot.val();
          let proceed = true;
          for(let player in readyStateObj){
            if(!readyStateObj[player]){
              proceed = false;
            }
          }
          if(proceed = true){
            showPrompt();
          }
        })
    }

    const onReady = () => {
      readyRef.update({
        [user]: true
      })
    }

    const handleCard = (snapshot) => {
      // console.log(snapshot.val());
    }

    const submitCard = () => {
      cardsRef.update({cardToPlay});
    }
    
    const editCard = () => {
      cardsRef.once('value')
        .then((snapshot) => {
          let cardText = snapshot.val().cardToPlay;
          const input = document.getElementsByTagName('input');
          input.text = cardText;
        })
    }

    const inputHandler = (e) => {
      let input = e.target.value;
      playCard(input);
    }

    return (
        <div>
	       {
          !roundDone ?
          <div>
            <h1>{displayPrompt}</h1>
            {
              playersTurn !== user ? 
              <div>
                <input id='card-input' type='text' placeholder='Fill in the blank' onInput={(e) => inputHandler(e)} /> 
                <button onClick={submitCard} >Play</button>
                <button onClick={editCard} >Edit</button>
              </div>
              : 
              <p>You're judging!</p>
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