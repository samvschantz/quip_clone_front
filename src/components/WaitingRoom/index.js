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
    // console.log(props.firebase.auth().currentUser);

    useEffect(() => {
    }, [])
    //FIRST and second FIRST is the game creator and one to press start game
    //When both are in waiting room both should have usersObj in state

    //OBVIOUSLY react re-renders when setting state in useEffect()

    const handlePacket = (snapshot) => {
        let newPlayer       = snapshot.val().playerName;
        let newPlayerData   = snapshot.val();
        if(!players.includes(newPlayer)){
            let newPlayers      = [...players, newPlayer];
            setData(newPlayers);
        }
    }

    usersRef.on('child_added', handlePacket);
    
    // console.log(usersObj);
    // console.log(Object.keys(usersObj).length);
    // if(Object.keys(usersObj).length > 1){
    //     console.log('this should run')
    //     usersRef.once('value')
    //         .then((snapshot) => {
    //           users = snapshot.val();
    //           setUsers(users);
    //           console.log(users);
    //         })
    // }

    const startGameHandler = () => {
        console.log('inside startGameHandler');
        console.log(usersObj);
        dbReference.ref('games/' + gameId).update({
            gameState: { started: true }
        })
        setStartGame(true);
    }

    gameRef.on('child_changed', startGameHandler);

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