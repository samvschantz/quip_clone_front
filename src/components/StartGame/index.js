import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';

function StartGame(props) {

    const [playersPoints, setPlayersDisplay] = useState([]);

    const user        = props.user;
    const gameId      = props.gameId;
    const users       = props.users;
    const playerNames = Object.keys(users);
    const dbReference   = props.firebase.database();


    useEffect(() => {
      pointsDisplay();
    }, [])



    const pointsDisplay = () => {
      let rows = [];
      for(let user in users){
        rows.push(user + ' has ' + users[user].points + ' points'); 
      }
      setPlayersDisplay(rows);
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
      }
    }

    //build with no time limit initially

    return (
        <div>
          <h1>Players</h1>
          {playersPoints.map((player, index) => (
              <span key={index}>{player}</span>
          ))}
          <p></p>
        </div>
    )
}

export default withFirebase(StartGame);