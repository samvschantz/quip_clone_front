import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';

function StartGame(props) {

    const [playersPoints, setPlayersDisplay] = useState([]);

    const user        = props.user;
    const gameId      = props.gameId;
    const users       = props.users;

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

    const startGameHandler = () => {
    }

    return (
        <div>
          <h1>Players</h1>
          {playersPoints.map((player, index) => (
              <span key={index}>{player}</span>
          ))}
        </div>
    )
}

export default withFirebase(StartGame);