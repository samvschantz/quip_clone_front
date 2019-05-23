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
    const readyRef      = dbReference.ref('games/' + gameId + '/gameState/promptReady')

    useEffect(() => {
        usersRef.once('value')
            .then((snapshot) => {
                handlePacket(snapshot);
            })
    }, [])

    const handlePacket = (snapshot) => {
        if(snapshot.key === 'players'){
            let allPlayers      = snapshot.val();
            let allPlayersArr   = Object.keys(allPlayers);
            setData(allPlayersArr);
        }
    }

    gameRef.on('child_changed', handlePacket);

    const startGameHandler = () => {
        gameRef.off();
        gameStateRef.off();
        usersRef.once('value')
            .then((snapshot) => {
                setUsers(snapshot.val())
            })
            .then(() => {
                readyRef.update({
                    [user]: false
                })
                gameStateRef.update({
                    started: true
                })
                setStartGame(true);
            })
    }

    gameStateRef.on('child_changed', startGameHandler);

    const copyId = () => {
        let id = document.getElementById('id').innerHTML;
        id = id.substring(6, 16)
        var textarea = document.createElement("textarea");
        textarea.textContent = id;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy"); // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }

    return (
        <div>
        { !startGame ?
            <div>
                <h1>Players</h1>
                <p id='id'>Room: {gameId}</p>
                <button onClick={copyId}>Copy game Id</button>
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