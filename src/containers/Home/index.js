import React, { Component } from 'react';
import { withFirebase } from '../../firebase';

class Home extends Component {
  state = {
    gameId: ''
  }

  checkName = () => {
    const nameInput = document.getElementById('name-input');
    let name = nameInput.value;
    if(name.length > 2){
      let buttons = Array.from(document.getElementsByTagName('button'));
      buttons.forEach(function(button){
        button.disabled = false;
      });
    }
  }

  inputHandler = () => {
    this.checkName();
  }

  newGame = () => {
  }

  joinGame = () => {
  }

  render(){
    return(
      <div>
        <input id="name-input" placeholder="Name Required" onInput={this.inputHandler} />
        <button onClick={this.newGame} disabled>New Game</button>
        <button onClick={this.joinGame} disabled>Join Game</button>
      </div>
    )
  }
}

export default Home;