import React from 'react';
import { withFirebase } from '../../firebase';

function Round(props) {

    const [roundDone, finishRound]  = useState(false);

	const user          = props.user;
    const gameId        = props.gameId;
    const users         = props.users;
    const turn 			= props.turn;
    const whosTurn 		= props.whosTurn;
    const userInfo      = users[user];
    const playerNames   = Object.keys(users);
    const dbReference   = props.firebase.database();
    const gameStateRef  = dbReference.ref('games/' + gameId + '/gameState');

    console.log(whosTurn);

    return (
        <div>
	       {!roundDone ?  
          <div>
            <h1>Players</h1>
            {playersPoints.map((player, index) => (
                <span key={index}>{player}</span>
            ))}
          </div>
          :<StartGame turn={turn} gameId={gameId} user={user} users={users} whosTurn={whosTurn}/>
          }
        </div>
    )
}

export default withFirebase(Round);