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

  nameInputHandler = (e) => {
    let name = e.target.value;
    let buttons = Array.from(document.getElementsByTagName('button'));
    if(name.length > 2){
      buttons.forEach(function(button){ 
        button.classList.remove("noClick");
      })
    } else {
      buttons.forEach(function(button){ 
        button.classList.add("noClick");
      })
    }
  }


  render(){
    return(
      <div className="start-screen">
        <p>Enter a name to get started</p>
        <p>Name & Game ID required to join existing game.</p>
        <input id="name-input" placeholder="Name required to start or join game" onInput={this.nameInputHandler} />
        <button className="noClick" id="new-game-button" onClick={this.newGame} >New Game</button>
        <button className="noClick" id="join-game-button" onClick={this.joinGame} >Join Game</button>
        <input id="game-id-input" placeholder="Game ID required to join game" />
        <p id="error-block"></p>
      </div>
    )
  }
}

export default withFirebase(Home);