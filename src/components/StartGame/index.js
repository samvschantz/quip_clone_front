import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import Round from '../Round'

function StartGame(props) {

    const [playersPoints, setPlayersDisplay]  = useState([]);
    const [turnChanged, setTurnChange]        = useState(false);
    const [turn, setTurn]                     = useState(0);
    const [playersTurn, setPlayersTurn]       = useState('');
    const [turnOrder, setTurnOrder]           = useState([]);

    const user          = props.user;
    const gameId        = props.gameId;
    const users         = props.users;
    const userInfo      = users[user];
    const playerNames   = Object.keys(users);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');
    let currentTurn            = 0;
    let whosTurn        = '';

    useEffect(() => {
      if(turnChanged === false){
        pointsDisplay();
      }
    }, [])

    const moveTurn = () => {
      console.log('did we at least get here???')
      gameStateRef.once('value')
        .then((snapshot) => {
          currentTurn = snapshot.val().turn;
          let shuffledPlayers = [];
          //If it is before the first turn and the user is the gameOwner set the turn order
          if(currentTurn === 0 && userInfo.gameOwner){
            shuffledPlayers = shuffle(playerNames);
            setTurnOrder(shuffledPlayers);   
            let whosTurn = '';
            shuffledPlayers.length > 0 ? whosTurn = shuffledPlayers[currentTurn]: whosTurn = '';
            if(whosTurn !== ''){
              console.log('did gameOwner get here?')
              gameStateRef.update({
                turn      : 1,
                turnOrder : shuffledPlayers,
                whosTurn  : whosTurn 
              })
              setTurn(1);
              setPlayersTurn(whosTurn);
              setTurnChange(true);
            }
          } else if(userInfo.gameOwner){
            currentTurn++;
            setTurn(turn);
            let whosTurn = turnOrder[currentTurn];
            setPlayersTurn(whosTurn);
            gameStateRef.update({
              turn      : turn,
              whosTurn  : whosTurn
            })
            setTurnChange(true);
          }
          console.log('did non game owners get here?')
        })
    }

    const pointsDisplay = () => {
      let rows = [];
      for(let user in users){
        rows.push(user + ' has ' + users[user].points + ' points'); 
      }
      setPlayersDisplay(rows);
      window.setTimeout(moveTurn, 500);
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
      }
      return array;
    }

    //build with no time limit initially
    //Just get turn order sorted in gameState
    // then make sure everyone is seeing same screens at same time

    return (
        <div>
          {! turnChanged ?  
          <div>
            <h1>Players</h1>
            {playersPoints.map((player, index) => (
                <span key={index}>{player}</span>
            ))}
          </div>
          :<Round turn={turn} />
          }
        </div>
    )
}

export default withFirebase(StartGame);