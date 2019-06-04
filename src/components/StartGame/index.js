import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import Round from '../Round'

function StartGame(props) {

    const [playersPoints, setPlayersDisplay]  = useState([]);
    const [turnChanged, setTurnChange]        = useState(false);
    const [turn, setTurn]                     = useState(0);
    const [playersTurn, setPlayersTurn]       = useState('');
    const [turnOrder, setTurnOrder]           = useState([]);
    const [users, setUsers]                   = useState({});

    const user          = props.user;
    const gameId        = props.gameId;
    const usersData     = props.users;
    const userInfo      = usersData[user];
    const playerNames   = Object.keys(usersData);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');
    const usersRef      = dbReference.ref('games/' + gameId + '/players');
    let currentTurn     = 0;
    let whosTurn        = '';

    useEffect(() => {
      if(turnChanged === false){
        pointsDisplay();
      }
    }, [])

    const triggerTurnChange = () => {
      if(currentTurn === 0){
        gameStateRef.once('value')
          .then((snapshot) => {
            whosTurn = snapshot.val().whosTurn;
            setPlayersTurn(whosTurn);
            setTurnChange(true);
          })
      } else {
        setTurnChange(true);    
      }
    }

    const moveTurn = () => {
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
              gameStateRef.update({
                turn      : 1,
                turnOrder : shuffledPlayers,
                whosTurn  : whosTurn
              })
              setTurn(1);
              triggerTurnChange();
            }
          } else if(userInfo.gameOwner){
            gameStateRef.once('value')
              .then((snapshot) => {
                let dbTurnOrder = snapshot.val().turnOrder;
                setTurnOrder(dbTurnOrder)
                return dbTurnOrder
              })
              .then((dbTurnOrder) => {
                if(currentTurn <= 2){
                  currentTurn++;
                } else {
                  currentTurn -= 2;
                }
                setTurn(currentTurn);
                let whosTurn = dbTurnOrder[currentTurn - 1];
                setPlayersTurn(whosTurn);
                gameStateRef.update({
                  turn      : currentTurn,
                  whosTurn  : whosTurn
                })
                // triggerTurnChange();
              })
          }
          triggerTurnChange();
        })
    }

    const pointsDisplay = () => {
      let rows = [];
      usersRef.once('value')
        .then((snapshot) => {
          let usersObj = snapshot.val();
          setUsers(usersObj);
          for(let user in usersObj){
            rows.push(user + ' has ' + usersObj[user].points + ' points');
          }
          setPlayersDisplay(rows);
          //this sets  length of display before next turn - could also just have a ready? button
          window.setTimeout(moveTurn, 8000);
        })
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--){
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
          {!turnChanged ?
            <div className="start-game">
              <div className="flip-2-hor-top-1 card">   
                <h1>Players</h1>
                {playersPoints.map((player, index) => (
                    <span key={index}>{player}</span>
                ))}
                <span className="quip">quip</span>
              </div>
            </div>
          :<Round turnOrder={turnOrder} turn={turn} gameId={gameId} user={user} users={users} playersTurn={playersTurn}/>
          }
        </div>
    )
}

export default withFirebase(StartGame);