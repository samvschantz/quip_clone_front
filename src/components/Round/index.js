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
    const [twoInputs, isTwo]              = useState(false);

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
        let Prompt = Prompts[promptIndex].text;
        let two = Prompts[promptIndex].pick;
        if(two === 2){
          isTwo(true);
        }
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
      let input = document.getElementById('card-input').value;
      console.log(input);
      if(twoInputs){
        let secondInput = document.getElementById('card-input-two').value;
        console.log(secondInput);
        input += ' ' + secondInput;
      }
      userCardsRef.update({input});
    }

    const editCard = () => {
      userCardsRef.once('value')
        .then((snapshot) => {
          let cardText = snapshot.val().input;
          const input = document.getElementsByTagName('input');
          input.text = cardText;
        })
    }

    const beginJudge = () => {
      console.log('beginJudge')
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
                    console.log(cardsObj)
                    let responseArr = [];
                    for(let player in cardsObj){
                      console.log(cardsObj[player])
                      console.log(cardsObj[player].input)
                      responseArr.push(cardsObj[player].input)
                    }
                    console.log(responseArr)
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
            if(cardData[user].input === response){
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
                    <>
                    {!twoInputs ?
                      <div>
                        <input id='card-input' type='text' placeholder='Fill in the blank'/>
                        <button onClick={submitCard} >Play</button>
                        <button >Edit</button>
                      </div>
                      :
                      <div>
                        <input id='card-input' type='text' placeholder='Fill in the blank'/>
                        <input id='card-input-two' type='text' placeholder='Fill in the second blank'/>
                        <button onClick={submitCard} >Play</button>
                        <button >Edit</button>
                      </div>
                    }
                    </>
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
              <div>
              <h1>{displayPrompt}</h1>
                {
                  turn !== user ?
                  <>
                  <p> {turn} is now judging.</p>
                  {responses.map((response, index) => (
                    <span key={index}>{response}</span>
                  ))}
                  </>
                  :
                  <>
                  <p>Choose a card:</p>
                  {responses.map((response, index) => (
                    <div key={index}>
                      <span>{response}</span> <button onClick={() => handleChoice(response)}>Choose</button>
                    </div>
                  ))}
                  </>
                }
              </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} turnOrder={turnOrder}/>
          }
        </div>
    )
}

export default withFirebase(Round);