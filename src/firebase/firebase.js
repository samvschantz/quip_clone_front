import firebase from 'firebase/app';
import 'firebase/database';

const config = {

};

class Firebase {
    constructor() {
        firebase.initializeApp(config);
        this.db = firebase.database();
    }

    database = () => {
      return this.db;
    }
}

export default Firebase;