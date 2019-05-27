import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]        = useState(false);
    const [judging, finishPlay]           = useState(false);
    const [displayPrompt, setTextDisplay] = useState('');
    const [cardToPlay, playCard]          = useState('');
    const [numPlayed, addCard]            = useState(0);

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
      cardsRef.on('child_added', handleCard);
      console.log('gameStateListener');
      console.log(Date.now());
      setPrompt();
    }

    const setPrompt = () => {
      console.log('setPrompt');
      console.log(Date.now());
      if(users[user].gameOwner){
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
          if(proceed === true){
            readyRef.off();
            showPrompt();
          }
        })
    }

    const onReady = () => {
      console.log('onReady');
      console.log(Date.now());
      readyRef.update({
        [user]: true
      })
    }

    const handleCard = (snapshot) => {
      let cardSubmitted = snapshot.val().cardToPlay;
      cardsRef.once('value')
        .then((snapshot) => {
          let playedObj = snapshot.val();
          if(Object.keys(playedObj).length === playerNames.length - 1){
            cardsRef.off();
            console.log('we should head to judging now')
          }
          addCard(Object.keys(playedObj).length);
        })
    }

    const submitCard = () => {
      userCardsRef.update({cardToPlay});
    }
    
    const editCard = () => {
      userCardsRef.once('value')
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
            !judging ?    
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
                <p>{numPlayed}/{playerNames.length - 1} cards have been played.</p>
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