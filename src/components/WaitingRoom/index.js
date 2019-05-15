import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
// import Users from './Users'

function WaitingRoom(props) {
    const [startGame, setStartGame] = useState(false);
    const [players, setData]        = useState([]);
    const [usersObj, setUsers]      = useState({});

    const user        = props.user;
    const gameId      = props.gameId;
    const dbReference = props.firebase.database();
    let users         = {};

    useEffect(() => {
        const usersRef = dbReference.ref('games/' + gameId + '/players');
        usersRef.once('value')
            .then((snapshot) => {
              users = snapshot.val();
              setUsers(users);
            })
            .then(() => {
              let players = Object.keys(users);
              setData(players);
            })

        usersRef.orderByChild('sentFrom')
            .startAt('client')
            .endAt('client')
            .on('child_added', handlePacket);
    }, [])

    const handlePacket = (snapshot) => {
        console.log(snapshot.val())
    }

    const startGameHandler = () => {
        dbReference.ref('games/' + gameId).update({
            gameState: { started: true }
        })
        setStartGame(true);
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
        : <StartGame gameId={gameId} user={user} users={usersObj}/>}
        </>
    )
}

export default withFirebase(WaitingRoom);