import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';
// import Users from './Users'

function WaitingRoom(props) {
    const [startGame, setStartGame] = useState(false);
    const [players, setData]        = useState([props.user]);
    const [usersObj, setUsers]      = useState({});

    const user        = props.user;
    const gameId      = props.gameId;
    const dbReference = props.firebase.database();
    const usersRef    = dbReference.ref('games/' + gameId + '/players');
    let users         = {};
    // console.log(props.firebase.auth().currentUser);

    useEffect(() => {
        usersRef.once('value')
            .then((snapshot) => {
              users = snapshot.val();
              setUsers(users);
            })
            .then(() => {
              let players = Object.keys(users);
              setData(players);
            })
    }, [])

    const handlePacket = (snapshot) => {
        let newPlayerData   = snapshot.val();
        let newPlayer       = newPlayerData.playerName;
        if(!players.includes(newPlayer)){
            let newPlayers      = [...players, newPlayer];
            setData(newPlayers); 
            console.log('do we ever actually get here?') 
            let newPlayersData  = {...usersObj, [newPlayer]: newPlayerData}
            setUsers(newPlayersData);       
        }
    }

    usersRef.on('child_added', handlePacket);

    const startGameHandler = () => {
        console.log(usersObj);
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