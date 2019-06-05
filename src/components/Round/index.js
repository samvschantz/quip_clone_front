import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
import Prompts from '../../prompts/ff-prompts.json';

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
    const [winnerIs, setWinner]           = useState('');

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


    useEffect(() => {
      checkForWinner();
      gameListeners();
      setPrompt();
    }, [])

    const checkForWinner = () => {
      playersRef.once('value')
        .then((snapshot) =>{
          let playersData = snapshot.val()
          for(let player in playersData){
            if(playersData[player].points === 7){
              setWinner(player);
            }
          }
        })
    }

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
        window.setTimeout(function() { goToJudging('time'); }, 30000);
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
            goToJudging('cards');
          }
          addCard(Object.keys(playedObj).length);
        })
        .then(() => {
          beginJudge('cards');
        })
    }

    const submitCard = () => {
      let inputFields = document.getElementsByTagName('input');
      let inputValues = '';
      let numBlanks   = displayPrompt.split('_').length - 1;
      let toDisplay   = displayPrompt;
      let ignored     = false;
      const error     = document.getElementById('error');
      for(let i = 0; i < inputFields.length; i++){
        let value = inputFields[i].value;
        if(value === ''){
          ignored = true;
        }
        if(numBlanks > i){
          inputValues = toDisplay.replace('_', value);
          toDisplay = inputValues;
        } else {
          inputValues += value;
        }
      }
      if(ignored === false){
        if(error.classList.contains('show')){
          error.classList.remove('show');
        }
        setDispInputs('');
        userCardsRef.update({inputValues});
      } else {
        error.classList.add('show')
      }
    }

    const beginJudge = (gotHere) => {
      cardsRef.once('value')
        .then((snapshot) => {
          return snapshot.val()
        })
        .then((cards) => {
          if(gotHere === 'time' || Object.keys(cards).length === playerNames.length - 1){
            gameStateRef.off();
            gameStateRef.on('child_changed', backToStart);
            readyRef.once('value')
              .then((snapshot) => {
                startJudging(true);
                gameStateRef.once('value')
                  .then((snapshot) => {
                    let responseArr = [];
                    if(snapshot.val().cards){
                      let cardsObj = snapshot.val().cards;
                      for(let player in cardsObj){
                        responseArr.push(cardsObj[player].inputValues)
                      }
                    }
                    setResponses(responseArr);
                    if(responseArr.length === 0){
                      finishRound(true);
                    }
                })
              })
          }
        })
    }

    const goToJudging = (gotHere) => {
      gameStateRef.update({
        judging: true
      })
      if(gotHere === 'time'){
        beginJudge('time');
      }
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

    const restart = () => {
      window.location.reload();
    }

    return (
        <div className="round">
	       {
          winnerIs === '' ?
            !roundDone ?
              !judging ?
                <div>
                  <h1 dangerouslySetInnerHTML={{__html: displayPrompt}}></h1>
                  {
                    turn !== user ?
                      <div>
                        {displayInputs}
                        {displayInputs !== '' ? <button onClick={submitCard}>Play</button> : ''}
                        <p id="error">Make sure to fill all fields before clicking play!</p>
                      </div>
                    :
                    <p>You're judging!</p>
                  }
                 {
                    turn !== user ? <p> {turn} is judging this round!</p> : ''
                  }
                  <p>{numPlayed} card{numPlayed === 1 ? '':'s'} ha{numPlayed === 1 ? 's':'ve'} been played.</p>
                  {!time ? ''
                  : <>
                      <div className="timer one">turns last 30 seconds</div>
                    </>
                  }
                </div>
              :
                <div className="judging">
                <h1 dangerouslySetInnerHTML={{__html: displayPrompt}}></h1>
                  {
                    turn !== user ?
                    <>
                    <p> {turn} is now judging.</p>
                      <div className="cards">
                        {responses.map((response, index) => (
                          <div className="flip-2-hor-top-1 card" key={index}>
                            <span key={index} dangerouslySetInnerHTML={{__html: response}}></span>
                            <span className="quip">quip</span>
                          </div>
                        ))}
                      </div>
                    </>
                    :
                    <>
                    <p>Choose a card:</p>
                    <div className="cards">
                      {responses.map((response, index) => (
                        <div className="flip-2-hor-top-1 card" key={index}>
                          <span dangerouslySetInnerHTML={{__html: response}}></span> <button onClick={() => handleChoice(response)}>Choose</button>
                          <span className="quip">quip</span>
                        </div>
                      ))}
                    </div>
                    </>
                  }
                </div>
            :<StartGame turn={turn} gameId={gameId} user={user} users={users} turnOrder={turnOrder}/>
          :<>
            <div className="cards">
              <div className="flip-2-hor-top-1 card">
                  <span>The winner is: {winnerIs}</span>
                  <button onClick={restart}>Play again?</button>
                </div>
            </div>
            </>
          }
        </div>
    )
}

export default withFirebase(Round);