import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
// import Users from './Users'

function WaitingRoom(props) {
    const [startGame, setStartGame] = useState(false);
    const [players, setData]        = useState([props.user]);
    const [usersObj, setUsers]      = useState({});
    let [, updateState] = React.useState();

    const user        = props.user;
    const gameId      = props.gameId;
    const dbReference = props.firebase.database();
    const usersRef    = dbReference.ref('games/' + gameId + '/players');
    const gameRef     = dbReference.ref('games/' + gameId + '/gameState');

    let users         = {};

    useEffect(() => {
    }, [])

    const handlePacket = (snapshot) => {
        let newPlayer       = snapshot.val().playerName;
        let newPlayerData   = snapshot.val();
        if(!players.includes(newPlayer)){
            let newPlayers      = [...players, newPlayer];
            setData(newPlayers);
            let newPlayersData  = {...newPlayerData, usersObj};
            setUsers(newPlayersData);
        }   
    }

    usersRef.on('child_added', handlePacket);
    
    const startGameHandler = () => {
        dbReference.ref('games/' + gameId).update({
            gameState: { started: true }
        })
        setStartGame(true);
    }

    gameRef.on('child_changed', startGameHandler);

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