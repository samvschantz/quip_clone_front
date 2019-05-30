import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]        = useState(false);
    const [judging, startJudging]         = useState(false); 
    const [displayPrompt, setTextDisplay] = useState('');
    const [numPlayed, addCard]            = useState(0);
    const [cardToPlay, playCard]          = useState('');
    const [turn, setTurn]                 = useState('');

	  const user                            = props.user;
    const gameId                          = props.gameId;
    const users                           = props.users;
    const playersTurn                     = props.playersTurn;
    const userInfo                        = users[user];
    const playerNames                     = Object.keys(users);
    const dbReference                     = props.firebase.database();
    const gameStateRef                    = dbReference.ref('games/' + gameId + '/gameState');
    const readyRef                        = dbReference.ref('games/' + gameId + '/promptReady');
    const cardsRef                        = dbReference.ref('games/' + gameId + '/gameState/cards');
    const userCardsRef                    = dbReference.ref('games/' + gameId + '/gameState/cards/' + user);
    // const apiUrl                          = 'https://crhallberg.com/cah';

    useEffect(() => {
      gameListeners();
      setPrompt();      
    }, [])

//Beginning of code to set and display prompt for all users simultaneously
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
          console.log(snapshot.val());
          console.log(snapshot.val().whosTurn);
          setTurn(snapshot.val().whosTurn);
        })
        .then(() => {
          readyRef.update({
            [user]: false
          })  
        })
        window.setTimeout(function() { goToJudging('timeout'); }, 30000);
    }

    //Needed to ensure all displays happen only AFTER all players are ready to display
    const readyUp = () => {
      readyRef.once('value')
        .then((snapshot) => {
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
//end of set prompt code


    const handleCard = (snapshot) => {
      let cardSubmitted = snapshot.val().cardToPlay;
      cardsRef.once('value')
        .then((snapshot) => {
          let playedObj = snapshot.val();
          if(Object.keys(playedObj).length === playerNames.length - 1){
            cardsRef.off();
            goToJudging('all cards submitted');
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
      console.log('hmmm')
      let input = e.target.value;
      playCard(input);
    }

    const goToJudging = (gotHere) => {
      console.log(gotHere);
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
                  playersTurn !== user ? <p> {turn} is judging this round!</p> : ''
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