import React, {Component} from "react";
import {Header, Container, Tab, Button, Dropdown, Grid, TextArea, Form, Table} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import *  as _ from "lodash";


class BackupPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            backupList: '',
            backupLogs: "",
            backupReady:true
        };
        this.props.socket.on("backupSuccessful",()=>{
            this.setState({backupReady:true})
        })
    }

    createBackup = () => {
        this.setState({backupReady:false});
        this.props.socket.emit("createBackup")
    };

    renderTable = () => {
        return this.props.backupList ? this.props.backupList.map((elem, index, array) => {
                let splitedTmp = _.compact(elem.text.trim().split(" "));
                return (
                    <Table.Row>
                        <Table.Cell>{splitedTmp[3]} {splitedTmp[2]} {splitedTmp[5]} {splitedTmp[4]}</Table.Cell>
                        <Table.Cell>{splitedTmp[0]} backup</Table.Cell>
                        <Table.Cell>{splitedTmp[6]}</Table.Cell>
                    </Table.Row>
                )
            }) :
            <Table.Row>
                <Table.Cell>Not have data</Table.Cell>
            </Table.Row>

    };

    render() {
        return (
            <Container>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Header as='h3' dividing>
                                Create Backups panel
                                <Header.Subheader>
                                    Create backup and push them on AWS S3
                                </Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            <Form>
                                <Form.Field>
                                    <label>1. Existing backups</label>
                                    <Table compact='very'>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Date of creating</Table.HeaderCell>
                                                <Table.HeaderCell>Type of backup</Table.HeaderCell>
                                                <Table.HeaderCell>Number of added volumes</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {this.renderTable()}
                                        </Table.Body>
                                    </Table>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Form>
                                <Form.Field>
                                    <label>2. Start backup</label>
                                    <Button disabled={!this.state.backupReady} onClick={this.createBackup}
                                            fluid>Backup</Button>
                                </Form.Field></Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={13}>
                            <Form>
                                <Form.Field>
                                    <label>3. Look at backup process</label>
                                    <TextArea readOnly style={{height: 550, resize: "none"}}/>

                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Form.Field style={{marginTop: "2rem"}}>
                                <label/>
                                <Button disabled={this.state.backupLogs === ''} onClick={this.clearLog} fluid>Clear
                                    logs</Button>
                            </Form.Field>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        )
    }
}

export default BackupPanel;