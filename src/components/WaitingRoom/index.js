import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
// import Users from './Users'

function WaitingRoom(props) {
    const [startGame, setStartGame] = useState(false);
    const [players, setData]        = useState([props.user]);
    const [usersObj, setUsers]      = useState({});

    const user          = props.user;
    const gameId        = props.gameId;
    const dbReference   = props.firebase.database();
    const gameRef       = dbReference.ref('games/' + gameId);
    const usersRef      = dbReference.ref('games/' + gameId + '/players');
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');

    useEffect(() => {
        usersRef.once('value')
            .then((snapshot) => {
                handlePacket(snapshot);
            })
    }, [])

    const handlePacket = (snapshot) => {
        let allPlayers      = snapshot.val();
        let allPlayersArr   = Object.keys(allPlayers);
        setData(allPlayersArr);
    }

    gameRef.on('child_changed', handlePacket);

    const startGameHandler = () => {
        usersRef.once('value')
            .then((snapshot) => {
                setUsers(snapshot.val())
            })
            .then(() => {
                gameRef.update({
                    gameState: { started: true }
                })
                setStartGame(true);
            })
    }

    gameStateRef.on('child_changed', startGameHandler);

    return (
        <div>
        { !startGame ?
            <div>
                <h1>Players</h1>
                <p>Room: {gameId}</p>
                {players.map((player, index) => (
                    <span key={index}>{player}</span>
                ))}
                <button onClick={startGameHandler}>Start Game</button>
            </div>
        : <StartGame gameId={gameId} user={user} users={usersObj}/>}
        </div>
    )
}

export default withFirebase(WaitingRoom);