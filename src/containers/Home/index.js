import React, { Component } from 'react';
import WaitingRoom from '../../components/WaitingRoom';
import { withFirebase } from '../../firebase';
import shortid from 'shortid';

class Home extends Component {
  state = {
    gameId      : '',
    user        : '',
    gameStarted : false
  }
  // When the user enters info both new game and join game are greyed out.
  // When a name longer than 2 chars is entered new game becomes active
  // When a code 10 chars long is entered for game id and there is a name longer than 2 chars that becomes active
  // both become inactive if their standards are not met

  inputHandler = (e, input) => {
    let userInput   = e.target.value;
    let button      = document.getElementById(input + '-button');
    let joinButton  = document.getElementById('join-game-button');
    let joinInput   = document.getElementById('game-id-input');
    let error       = document.getElementById('error');
    if(userInput.length > 2 && input === 'new-game' && joinInput.value.length !== 9){
      error.classList.remove('show');
      button.classList.remove("noClick");
      this.setState({ user: userInput });
    } else if(userInput.length > 2 && input === 'new-game' && joinInput.value.length === 9){
      button.classList.remove("noClick");
      joinButton.classList.remove("noClick");
      this.setState({ 
        user   : userInput,
        gameId : joinInput.value 
      })
    } else if(userInput.length === 9 && input === 'join-game' && this.state.user.length > 2){
      button.classList.remove("noClick");
      this.setState({ gameId: userInput })
    } else if(userInput.length <= 2 && input === 'new-game'){
      error.classList.add('show');
    } else if(userInput.length > 2 && input === 'new-game'){
      error.classList.remove('show');
    } else {
      button.classList.add("noClick");
    }
  }

  newGame = () => {
    const gameId              = shortid.generate();
    const gameOwner           = this.state.user;
    const dbReference         = this.props.firebase.database()
    const gameReference       = dbReference.ref('games/' + gameId);
    const gameOwnerReference  = dbReference.ref('games/' + gameId + '/players/' + gameOwner);
    gameReference.set({
      gameOwner : gameOwner,
      gameState : {
        started         : false,
        judging         : false,
        turn            : 0,
        prompt          : '',
        cards           : {},
        lastRoundWinner : {
          winner: '',
          response: ''
        }
      }
    });
    gameOwnerReference.set({
      playerId  : shortid.generate(),
      gameOwner : true,
      points    : 0,
      playerName: gameOwner
    })
    this.setState({
      gameStarted : true,
      gameId      : gameId
    });
  }

  joinGame = () => {
    const gameId        = this.state.gameId;
    const user          = this.state.user;
    const gameReference = this.props.firebase.database().ref('games/');
    const errorBlock    = document.getElementById('error-block');

    //checking that there is a game & that players name is not already in use
    gameReference.once('value')
      .then((snapshot) => {
        if(!snapshot.hasChild(gameId)){
          //no game with this game id
          return Promise.reject();
        } else {
          const playerReference = this.props.firebase.database().ref('games/' + gameId + '/players/' + user);
          playerReference.once('value')
            .then((snapshot) => {
              if(snapshot.hasChild(user)){
                //name already in use
                return Promise.reject();
              } else {
                //add player to firebase
                playerReference.set({
                  playerId  : shortid.generate(),
                  gameOwner : false,
                  points    : 0,
                  playerName: user
                })
                this.setState({ gameStarted: true });
              }
            })
            .catch(() => {
              errorBlock.innerHTML = 'Name already taken please enter a new name';
            })
        }
      })
      .catch(() => {
        errorBlock.innerHTML = 'Does not match any current games. Please check your game id and try again';
      })

  }

  render(){
    return(

      <div>
        { this.state.gameStarted ? <WaitingRoom gameId={this.state.gameId} user={this.state.user} /> :
          <div className="start-screen">
            <div className="flip-2-hor-top-1">   
              <p>Enter name to get started</p>
              <input id="name-input" onInput={(e) => this.inputHandler(e, 'new-game')} />
              <button className="noClick" id="new-game-button" onClick={this.newGame} >New Game</button>
              <p id="error">Must enter a name longer than 3 characters to start</p>
              <p>Game ID</p>
              <input id="game-id-input" onInput={(e) => this.inputHandler(e, 'join-game')} />
              <button className="noClick" id="join-game-button" onClick={this.joinGame} >Join Game</button>
              <p id="error-block"></p>
              <span className="quip">quip</span>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default withFirebase(Home);