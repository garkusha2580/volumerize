import React, {Component} from "react";
import {Header, Container, Tab, Button, Dropdown, Grid, TextArea, Form} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import *  as _ from "lodash";

class RestorePanel extends Component {

    static defaultProps = {
        backupList: null
    };

    // eslint-disable-next-line
    constructor(props) {
        super(props);
        this.state = {
            restoreLogs: '',
            selectedBackup: -1,
            restoreReady:true
        };
        this.props.socket.on("log", (data) => {
            this.setState({restoreLogs: this.state.restoreLogs + "\n" + data})
        });
        this.props.socket.on("restoreComplete",()=>{
            this.setState({restoreReady:true});
        });
    }

    setBackupForRestore = (event, data) => {
        this.setState({selectedBackup: data.value})
    };

    restoreBackup = () => {
        if (this.state.selectedBackup !== -1)
            this.props.socket.emit("restore", this.state.selectedBackup);
            this.setState({restoreReady:false})
    };

    clearLog = () => {
        this.setState({restoreLogs: ''});
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
                                    <Button disabled={!this.state.restoreReady} onClick={this.restoreBackup} fluid>Restore</Button>
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
                                              value={this.state.restoreLogs}/>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Form.Field style={{marginTop:"2rem"}} >
                                <label/>
                                <Button  disabled={this.state.restoreLogs === ''} onClick={this.clearLog} fluid>Clear
                                    logs</Button>
                            </Form.Field>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

export default RestorePanel;