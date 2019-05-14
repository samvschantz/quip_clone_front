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
    let name = nameInput.value;
    if(name.length > 2){
      let buttons = Array.from(document.getElementsByTagName('button'));
      buttons.forEach(function(button){
        button.disabled = false;
      });
      this.setState({ user: name });
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
      <div>
        <input id="name-input" placeholder="Name Required" onInput={this.inputHandler} />
        <button onClick={this.newGame} >New Game</button>
        <button onClick={this.joinGame} >Join Game</button>
      </div>
    )
  }
}

export default withFirebase(Home);