import React, { Component } from 'react';
// import WaitingRoom from '../../components/WaitingRoom';
import { withFirebase } from '../../firebase';

class Home extends Component {
  state = {
    gameId: ''
  }

  render(){
    return(
      <div>
        <input placeholder="Hello world"/>
      </div>
    )
  }
}

export default Home;