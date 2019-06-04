import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/prompts.json';

function Round(props) {

    const [roundDone, finishRound]        = useState(false);
    const [judging, startJudging]         = useState(false);
    const [displayPrompt, setTextDisplay] = useState('');
    const [numPlayed, addCard]            = useState(0);
    const [cardsPlayed, playCard]         = useState([]);
    const [turn, setTurn]                 = useState('');
    const [time, setTimeAnimation]        = useState(false);
    const [responses, setResponses]       = useState([]);
    const [inputs, setInputs]             = useState(0);
    const [displayInputs, setDispInputs]  = useState('');

	  const user                            = props.user;
    const turnOrder                       = props.turnOrder;
    const gameId                          = props.gameId;
    const users                           = props.users;
    const userInfo                        = users[user];
    const playerNames                     = Object.keys(users);
    const dbReference                     = props.firebase.database();
    const gameStateRef                    = dbReference.ref('games/' + gameId + '/gameState');
    const playersRef                      = dbReference.ref('games/' + gameId + '/players');
    const readyRef                        = dbReference.ref('games/' + gameId + '/promptReady');
    const cardsRef                        = dbReference.ref('games/' + gameId + '/gameState/cards');
    const judgingRef                      = dbReference.ref('games/' + gameId + '/gameState/judging');
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
        let Prompt      = Prompts[promptIndex].text;
        let numInputs   = Prompts[promptIndex].pick;
        setInputs(numInputs);
        Prompts.splice(promptIndex, 1);
        gameStateRef.update({
          prompt: Prompt,
          inputs: numInputs
        })
      }
    }

    const showPrompt = () => {
      gameStateRef.once('value')
        .then((snapshot) => {
          let inputs = snapshot.val().inputs
          let displayedInputs = [];
          for(let i = 0; i < inputs; i++){
            let element = <input key={i} id='card-input' type='text' placeholder='Fill in the blank'/>
            displayedInputs.push(element);
          }
          setDispInputs(displayedInputs);
          setTextDisplay(snapshot.val().prompt);
          setTurn(snapshot.val().whosTurn);
          cardsRef.on('child_added', handleCard);
          cardsRef.on('child_changed', handleCard);
        })
        .then(() => {
          readyRef.update({
            [user]: false
          })
          readyRef.off();
        })
        // readyRef.on('child_changed', beginJudge);
        setTimeAnimation(true);
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
      readyRef.on('child_changed', readyUp);
      gameStateRef.on('child_changed', readyUp);
      readyRef.update({
        [user]: true
      })
    }
//end of set prompt code


    const handleCard = (snapshot) => {
      let cards         = cardsPlayed;
      let cardSubmitted = snapshot.val();
      cards.push(cardSubmitted);
      playCard(cards);
      cardsRef.once('value')
        .then((snapshot) => {
          let playedObj = snapshot.val();
          if(Object.keys(playedObj).length === playerNames.length - 1){
            cardsRef.off();
            goToJudging();
          }
          addCard(Object.keys(playedObj).length);
        })
        .then(() => {
          beginJudge();
        })
    }

    const submitCard = () => {
      let inputFields = document.getElementsByTagName('input');
      let inputValues = '';
      let numBlanks   = displayPrompt.split('_').length - 1;
      let toDisplay   = displayPrompt;
      for(let i = 0; i < inputFields.length; i++){
        let value = inputFields[i].value;
        if(numBlanks > i){
          inputValues = toDisplay.replace('_', value);
          toDisplay = inputValues;
        } else {
          inputValues += value;
        }
      }
      userCardsRef.update({inputValues});
    }

    const editCard = () => {
      userCardsRef.once('value')
        .then((snapshot) => {
          let cardText = snapshot.val().inputValues;
          const input = document.getElementsByTagName('input');
          input.text = cardText;
        })
    }

    const beginJudge = () => {
      cardsRef.once('value')
        .then((snapshot) => {
          return snapshot.val()
        })
        .then((cards) => {
          if(Object.keys(cards).length === playerNames.length - 1){
            gameStateRef.off();
            gameStateRef.on('child_changed', backToStart);
            readyRef.once('value')
              .then((snapshot) => {
                startJudging(true);
                gameStateRef.once('value')
                  .then((snapshot) => {
                    let cardsObj = snapshot.val().cards;
                    let responseArr = [];
                    for(let player in cardsObj){
                      responseArr.push(cardsObj[player].inputValues)
                    }
                    setResponses(responseArr);
                })
              })
          }
        })
    }

    const goToJudging = (gotHere) => {
      gameStateRef.update({
        judging: true
      })
    }

    //End of code before final choice happens

    const handleChoice = (response) => {
      cardsRef.once('value')
        .then((snapshot) => {
          let cardData = snapshot.val();
          for(let user in cardData){
            if(cardData[user].inputValues === response){
              playersRef.once('value')
                .then((snapshot) => {
                  let playerData = snapshot.val();
                  let points = 0;
                  for(let player in playerData){
                    if(player === user){
                      points += playerData[player].points + 1;
                    }
                  }
                  let userRef = dbReference.ref('games/' + gameId + '/players/' + user);
                  userRef.update({ points: points })
                })
              gameStateRef.update({
                lastRoundWinner: {
                  winner: user,
                  response: response
                }
              })
            }
          }
        })
    }

    const backToStart = (snapshot) => {
      if(Object.keys(snapshot.val())[1] === 'winner'){
        gameStateRef.update({
          judging : false,
          cards   : {},
          prompt  : ''
        })
      }
      if(snapshot.key === 'prompt'){
        finishRound(true);
      }
    }

    return (
        <div>
	       {
          !roundDone ?
            !judging ?
              <div>
                <h1>{displayPrompt}</h1>
                {
                  turn !== user ?
                    <div>
                      {displayInputs}
                      <button onClick={submitCard} >Play</button><button >Edit</button>
                    </div>
                  :
                  <p>You're judging!</p>
                }
               {
                  turn !== user ? <p> {turn} is judging this round!</p> : ''
                }
                <p>cards have been played.</p>
                {!time ? ''
                : <>
                    <div className="timer one"></div>
                    <div className="timer two"></div>
                    <div className="timer three"></div>
                    <div className="timer four"></div>
                    <div className="timer five"></div>
                    <div className="timer six"></div>
                  </>
                }
              </div>
            :
              <div className="judging">
              <h1>{displayPrompt}</h1>
                {
                  turn !== user ?
                  <>
                  <p> {turn} is now judging.</p>
                    <div class="cards">
                      {responses.map((response, index) => (
                        <div className="flip-2-hor-top-1 card" key={index}>
                          <span key={index}>{response}</span>
                        </div>
                      ))}
                    </div>
                  </>
                  :
                  <>
                  <p>Choose a card:</p>
                  <div class="cards">
                    {responses.map((response, index) => (
                      <div className="flip-2-hor-top-1 card" key={index}>
                        <span>{response}</span> <button onClick={() => handleChoice(response)}>Choose</button>
                      </div>
                    ))}
                  </div>
                  </>
                }
              </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} turnOrder={turnOrder}/>
          }
        </div>
    )
}

export default withFirebase(Round);