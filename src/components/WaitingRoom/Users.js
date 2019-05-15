// import React, { useRef } from 'react';
// import { withFirebase } from '../../firebase';

// function Users(props){
//     const dbReference = props.firebase.database();
//     const gameId = props.gameId;
//     let players = [];
//     let users = useRef({});

//   	dbReference.ref('games/' + gameId + '/players').once('value')
// 	    .then((snapshot) => {
// 	      users = snapshot.val();
// 	    })
// 	    .then(() => {
// 	      players = Object.keys(users);
// 	    })
// 	users = users.current;
// 	players = players.map((player, index) => (
// 	    <span key={index}>{player}</span>
// 	))
// 	return players;
// }

// export default withFirebase(Users);