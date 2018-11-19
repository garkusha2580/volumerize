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
            appState: "",
            backupLogs:""
        };
        this.state.socket.on("appState", (data) => {
            this.setState({appState: data})
        });
        this.props.socket.on("backupLog", (data) => {
            this.setState({backupLogs: this.state.backupLogs + "\n" + data});
            localStorage.setItem("backupLogs",  localStorage.setItem+"\n"+data);
        });
    }

    componentWillMount = () => {
        localStorage.setItem("restoreLogs","");
        localStorage.setItem("backupLogs","");
        if (!this.state.backupList) {
            axios.get(`/docker`).then(res => {
                this.setState({
                    backupList: res.data.trim().split("\n").map((value, index, array) => {
                        return {value: index, text: value}
                    })
                });
            });
        }
    };
    closeSocket = () => {
        this.setState({socket: false});
    };

    render() {

        let panel = [
            {
                menuItem: 'Backup',
                render: () => <Tab.Pane>
                    <BackupPanel parent={this} appState={this.state.appState} backupList={this.state.backupList}
                                 socket={this.state.socket}/>
                </Tab.Pane>
            },
            {
                menuItem: 'Restore',
                render: () => <Tab.Pane>
                    <RestorePanel parent={this} appState={this.state.appState} backupList={this.state.backupList}
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