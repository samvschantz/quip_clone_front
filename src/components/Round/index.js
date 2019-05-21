import React, { useState, useEffect } from 'react';
import { withFirebase } from '../../firebase';
import StartGame from '../StartGame';

function Round(props) {

	console.log(props.whosTurn);

    return (
        <div>
	       <a href="/gif/we-made-it-eQmc85" title="We Made It!">
	       	<img src="https://i.makeagif.com/media/2-27-2017/eQmc85.gif" alt="We Made It!" />
	       </a>
        </div>
    )
}

export default withFirebase(Round);