import React, {Component} from "react";
import {Header, Container, Tab, Button} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import * as axios from 'axios';
import io from "socket.io-client";
import Beforeunload from "react-beforeunload";
import RestorePanel from "../RestorePanel/index"
import BackupPanel from "../BackupPanel/index"

class MainPanel extends Component {
    // eslint-disable-next-line 
    constructor() {
        super();
        this.state = {
            socket: io.connect(`/`),
            backupList: "",
            restoreLogs: ""
        }
    }

    componentWillMount = () => {
        if (!this.state.backupList) {
            axios.get(`http://localhost:5001/docker`,{ username: 'admin', password: 'admin'}).then(res => {
                this.setState({
                    backupList: res.data.trim().split("\n").map((value, index, array) => {
                        return {value: index, text: value}
                    })
                });
            });
        }
    };
    runRestore = () => {
        this.state.emit("restoreStart",);
    };
    closeSocket = () => {
        this.setState({socket: false});
    };

    render() {
        let panel = [
            {
                menuItem: 'Backup',
                render: () => <Tab.Pane>
                    <BackupPanel backupList={this.state.backupList} socket={this.state.socket}/>
                </Tab.Pane>
            },
            {
                menuItem: 'Restore',
                render: () => <Tab.Pane>
                    <RestorePanel backupList={this.state.backupList} socket={this.state.socket}/></Tab.Pane>
            }
        ];
        return (
            <Beforeunload onBeforeunload={this.closeSocket}>
                <Container>
                    <Header size="huge" style={{marginTop: "1rem"}} textAlign="center">Volumerize UI panel</Header>
                    <Tab panes={panel}/>
                </Container>
            </Beforeunload>
        );
    }
}

export default MainPanel;