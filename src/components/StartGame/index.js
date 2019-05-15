import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';

function StartGame(props) {

    const user        = props.user;
    const gameId      = props.gameId;
    const users       = props.users;
    const players     = Object.keys(users);
    const dbReference = props.firebase.database();
    let userData      = {};

    useEffect(() => {
      console.log('this');
    }, [])

    const startGameHandler = () => {
      console.log('that');
    }

    return (
        <>
          <h1>Players</h1>
          {
            for(user in users){
              <span></span>
            }
          }
          {
            players.map((player, index) => (
              <span key={index}>{player}</span>
            ))
          }
        </>
    )
}

export default withFirebase(StartGame);