import React, {Component} from 'react';
import MainPanel from "./componets/MainPanel";
import '../node_modules/semantic-ui-css/semantic.min.css';
import io from "socket.io-client";


class App extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (

            <MainPanel/>

        );
    }
}

export default App;
