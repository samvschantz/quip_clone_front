import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import shortid from 'shortid';

class Home extends Component {
  state = {
    gameId: '',
    user: '',
    joinGameInfo: false,
    newGameInfo: true
  }
  // When the user enters info both new game and join game are greyed out.
  // When a name longer than 2 chars is entered new game becomes active
  // When a code 10 chars long is entered for game id and there is a name longer than 2 chars that becomes active
  // both become inactive if their standards are not met

  inputHandler = (e, input) => {
    let userInput = e.target.value;
    let button    = document.getElementById(input + '-button');
    if(userInput.length > 2 && input === 'new-game'){
      button.classList.remove("noClick");
      this.setState({ user: userInput });
    } else if(userInput.length === 9 && input === 'join-game' && this.state.user.length > 2){
      button.classList.remove("noClick");
      this.setState({ gameId: userInput })
    } else {
      button.classList.add("noClick");
    }
  }

  newGame = () => {
    const gameId      = shortid.generate();
    const gameOwner   = this.state.user;
    const dbReference = this.props.firebase.database().ref('games/' + gameId);
    dbReference.set({
        gameOwner : gameOwner,
        gameState : { started: false }
    });
  }

  joinGame = () => {
    let gameId        = this.state.gameId;
    const dbReference = this.props.firebase.database().ref('games/');
    const errorBlock  = document.getElementById('error-block'); 

    dbReference.once('value')
      .then((snapshot) =>{
        if(!snapshot.hasChild(gameId)){
          //no game with this game id
          return Promise.reject();
        } else {

        }
      }).catch(() =>{
        errorBlock.innerHTML = 'Does not match any current games. Please check your game id and try again';
      })

  }

  render(){
    return(
      <div className="start-screen">
        <p>Enter a name to get started</p>
        <p>Name & Game ID required to join existing game.</p>
        <input id="name-input" placeholder="Name required to start or join game" onInput={(e) => this.inputHandler(e, 'new-game')} />
        <button className="noClick" id="new-game-button" onClick={this.newGame} >New Game</button>
        <input id="game-id-input" placeholder="Game ID required to join game" onInput={(e) => this.inputHandler(e, 'join-game')} />
        <button className="noClick" id="join-game-button" onClick={this.joinGame} >Join Game</button>
        <p id="error-block"></p>
      </div>
    )
  }
}

export default withFirebase(Home);