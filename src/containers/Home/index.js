import React, { Component } from 'react';
import { withFirebase } from '../../firebase';
import shortid from 'shortid';

class Home extends Component {
  state = {
    gameId: '',
    user: ''
  }

  inputHandler = () => {
    const nameInput = document.getElementById('name-input');
    const newGameButton = document.getElementById('new-game-button');
    const joinGameButton = document.getElementById('join-game-button');
        
    let name = nameInput.value;
      
    if(name.length > 2){

    } else {

    }
  }

  newGame = () => {
    const gameId    = shortid.generate();
    const gameOwner = this.state.user;
    this.props.firebase.database().ref('games/' + gameId).set({
        gameOwner : gameOwner,
        gameState : { started: false }
    });
  }

  //Checks whether this name already exists for the given game
  checkName = () => {
  }

  joinGame = () => {
    this.checkName();
  }

  render(){
    return(
      <div className="start-screen">
        <input id="name-input" placeholder="Name required to start or join game" onInput={this.inputHandler} />
        <input id="game-id-input" placeholder="Game ID required to join game" onInput={this.inputHandler} />
        <button id="new-game-button" onClick={this.newGame} >New Game</button>
        <button id="join-game-button" onClick={this.joinGame} >Join Game</button>
      </div>
    )
  }
}

export default withFirebase(Home);