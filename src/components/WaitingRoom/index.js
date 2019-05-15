import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';

function WaitingRoom(props) {
    const [startGame, setStartGame] = useState(false);
    const [players, setData]        = useState([]);

    const user        = props.user;
    const gameId      = props.gameId;
    const dbReference = props.firebase.database();
    let users         = {};

    useEffect(() => {
      dbReference.ref('games/' + gameId + '/players').once('value')
        .then((snapshot) => {
          users = snapshot.val();
        })
        .then(() => {
          let players = Object.keys(users);
          setData(players);
        })

      dbReference.ref('games/' + gameId + '/gameState').once('value')
        .then((snapshot) => {
            return snapshot.val();
        })
        .then((data)=> {
            if(data.started) {
                setStartGame(true);
            }
        })
    }, [])

    const startGameHandler = () => {
        dbReference.ref('games/' + gameId).update({
            gameState: { started: true }
        })
    }

    return (
        <>
        { !startGame ?
            <>
                <h1>Players</h1>
                <p>Room: {gameId}</p>
                {players.map((player, index) => (
                    <span key={index}>{player}</span>
                ))}
                <button onClick={startGameHandler}>Start Game</button>
            </>
        : <StartGame gameId={gameId} user={user} users={users}/>}
        </>
    )
}

export default withFirebase(WaitingRoom);