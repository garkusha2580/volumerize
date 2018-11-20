import React, {Component} from "react";
import {Header, Container, Tab} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import * as axios from 'axios';
import io from "socket.io-client";
import RestorePanel from "../RestorePanel/index"
import BackupPanel from "../BackupPanel/index"

class MainPanel extends Component {
    // eslint-disable-next-line 
    constructor() {
        super();
        this.state = {
            socket: io.connect(`/`),
            backupList: "",
            restoreLogs: "",
            appState: true,
            backupLogs: ""
        };

        this.state.socket.on("appState", (data) => {
            this.setState({appState: data})
        });
        this.state.socket.on("backupLog", (data) => {
            this.setState({backupLogs: this.state.backupLogs + "\n" + data});
        });
        this.state.socket.on("restoreLog", (data) => {
            this.setState({restoreLogs: this.state.restoreLogs + "\n" + data});
        });
    }

    clearLogs(type){
        if (type === "backup") this.setState({backupLogs:""});
        if (type === "restore") this.setState({restoreLogs:""});
    }

    componentWillMount = () => {
        if (!this.state.backupList) {
            axios.get(`/docker`).then(res => {
                this.setState({
                    backupList: res.data.trim().split("\n").map((value, index, array) => {
                        return {value: index, text: value}
                    })
                });
            });
        }
        console.log(this.state.backupList)
    };
    closeSocket = () => {
        this.setState({socket: false});
    };

    render() {

        let panel = [
            {
                menuItem: 'Backup',
                render: () => <Tab.Pane>
                    <BackupPanel parent={this} appState={this.state.appState} logs={this.state.backupLogs}
                                 backupList={this.state.backupList}
                                 socket={this.state.socket}/>
                </Tab.Pane>
            },
            {
                menuItem: 'Restore',
                render: () => <Tab.Pane>
                    <RestorePanel parent={this} appState={this.state.appState} logs={this.state.restoreLogs}
                                  backupList={this.state.backupList}
                                  socket={this.state.socket}/></Tab.Pane>
            }
        ];
        return (
            //<Beforeunload onBeforeunload={this.closeSocket}>
            <Container>
                <Header size="huge" style={{marginTop: "1rem"}} textAlign="center">Volumerize UI panel</Header>
                <Tab panes={panel}/>
            </Container>
            // </Beforeunload>
        );
    }
}

export default MainPanel;