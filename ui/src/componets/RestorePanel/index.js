import React, {Component} from "react";
import {Header, Container, Button, Dropdown, Grid, TextArea, Form, Modal} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import *  as _ from "lodash";

class RestorePanel extends Component {

    static defaultProps = {
        backupList: null,

    };

    // eslint-disable-next-line
    constructor(props) {
        super(props);
        this.state = {
            selectedBackup: -1,
            restoreReady: true,
            passphrase: "",
            modal: false,

        };
        this.props.socket.emit("getAppState");
        // this.props.socket.on("restoreLog", (data) => {
        //     if (data) {
        //         this.setState({restoreLogs: this.state.restoreLogs + "\n" + data});
        //         localStorage.setItem("restoreLogs", this.state.restoreLogs);
        //     }
        // });
        this.props.socket.on("restoreComplete", () => {
            this.setState({restoreReady: true});
        });
        this.props.socket.on("restoreError", () => {
            this.setState({restoreReady: true});
        });
        this.props.socket.on("enterPassphrase", () => {
            this.setState({modal: !this.state.modal})
        })
    }

    componentWillMount = () => {
        this.setState({restoreReady: this.props.appState})
        // this.setState({restoreLogs: localStorage.getItem("restoreLogs") ? localStorage.getItem("restoreLogs") : ""});
    };

    componentWillReceiveProps(nextProps) {
        let tmpObj = {};
        tmpObj.restoreLogs = nextProps.restoreLogs;
        this.setState(tmpObj)
    }

    setBackupForRestore = (event, data) => {
        this.setState({selectedBackup: data.value})
    };

    restoreBackup = () => {
        this.setState({restoreReady: false});
        if (this.state.selectedBackup !== -1)
            this.props.socket.emit("createRestore", this.state.selectedBackup);
    };

    clearLog = () => {
        console.log("restore clear logs");
        this.props.parent.clearLogs("restore")
    };

    sendPasspharse = () => {
        this.setState({modal: !this.state.modal});
        this.props.socket.emit("sendPassphrase", this.state.passphrase);
        console.log("send pass")
    };

    enterPasspharse = (event, {name, value}) => {
        this.setState({passphrase: value})
    };

    render() {
        let readyList = this.props.backupList ? this.props.backupList.map((elem, index, array) => {
            let splitedTmp = _.compact(elem.text.trim().split(" "));
            return {
                value: `${splitedTmp[5]}-${splitedTmp[2]}-${splitedTmp[3]}T${splitedTmp[4]}`,
                text: `${splitedTmp[3]} ${splitedTmp[2]} ${splitedTmp[5]} ${splitedTmp[4]} [${splitedTmp[0]} backup| ${splitedTmp[6]}]`
            }
        }) : [{value: -1, text: "not data"}];
        return (
            <Container>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Header as='h3' dividing>
                                Ready Backups
                                <Header.Subheader>
                                    Select backup what you want to restore. All backups are saved on AWS S3
                                </Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            <Form>
                                <Form.Field>
                                    <label>1. Select backup</label>
                                    <Dropdown onChange={this.setBackupForRestore} placeholder='Select Backup'
                                              loading={readyList === 0} search
                                              fluid selection options={readyList}/>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Form>
                                <Form.Field>
                                    <label>2. Start restore backup</label>
                                    <Button disabled={!this.state.restoreReady} onClick={this.restoreBackup}
                                            fluid>Restore</Button>
                                </Form.Field></Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            <Form>
                                <Form.Field>
                                    <label>3. Look at restore process</label>
                                    <TextArea readOnly style={{height: 550, resize: "none"}}
                                              value={this.props.logs}/>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Form.Field style={{marginTop: "2rem"}}>
                                <label/>
                                <Button disabled={this.props.logs === ''} onClick={this.clearLog} fluid>Clear
                                    logs</Button>
                            </Form.Field>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Modal size="mini" open={this.state.modal}>
                    <Modal.Header>Input key passpharse</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <label>Passpharse</label>
                                <Form.Input type="text" value={this.state.passphrase} name='passpharse'
                                            onChange={this.enterPasspharse}/>
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={() => {
                            this.setState({modal: false})
                        }}>Cancel</Button>
                        <Button onClick={this.sendPasspharse} positive icon='mail' labelPosition='right'
                                content='Send'/>
                    </Modal.Actions>
                </Modal>
            </Container>
        );
    }
}

export default RestorePanel;