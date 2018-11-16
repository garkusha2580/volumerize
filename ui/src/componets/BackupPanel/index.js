import React, {Component} from "react";
import {Header, Container, Button,  Grid, TextArea, Form, Table} from "semantic-ui-react"
import 'semantic-ui-css/semantic.min.css';
import *  as _ from "lodash";


class BackupPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            backupList: '',
            backupLogs: "",
            backupReady: true,
            listData: {},
        };
        this.props.socket.on("backupLog", (data) => {
            this.setState({backupLogs: this.state.backupLogs + "\n" + data})
        });
        this.props.socket.on("backupComplete", () => {
            this.setState({backupReady: true})
        });
        this.props.socket.on("backupError", () => {
            this.setState({backupReady: true})
        });
    }

    componentDidMount = () => {
        if (this.props.backupList) this.setState({listData: {sortedData: this.makeList(this.props.backupList)}});
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.backupList) {
            this.setState({listData: {sortedData: this.makeList(nextProps.backupList)}});
        }
    }

    makeList = (backupList) => {
        return backupList.map((elem, index, array) => {
            let splitedTmp = _.compact(elem.text.trim().split(" "));
            return {
                date: `${splitedTmp[3]} ${splitedTmp[2]} ${splitedTmp[5]} ${splitedTmp[4]}`,
                type: `${splitedTmp[0]}`, volumes: splitedTmp[6]
            }
        });
    };
    clearLog = () => {
        this.setState({backupLogs: ''});
    };
    createBackup = () => {
        this.setState({backupReady: false});
        this.props.socket.emit("createBackup")
    };

    sort = clickedColumn => () => {
        const {column, sortedData, direction} = this.state.listData;
        console.log(column);
        if (column !== clickedColumn) {
            this.setState({
                listData: {
                    column: clickedColumn,
                    sortedData: _.sortBy(sortedData, [clickedColumn]),
                    direction: 'ascending',
                }
            });
            return
        }
        this.setState({
            listData: {
                column: clickedColumn,
                sortedData: sortedData.reverse(),
                direction: direction === 'ascending' ? 'descending' : 'ascending',
            }
        })
    };

    renderTable = (sortedData) => {
        return this.props.backupList ? sortedData.map((elem, index, array) => {
                return (
                    <Table.Row>
                        <Table.Cell>{elem.date}</Table.Cell>
                        <Table.Cell>{elem.type} backup</Table.Cell>
                        <Table.Cell>{elem.volumes}</Table.Cell>
                    </Table.Row>
                )
            }) :
            <Table.Row>
                <Table.Cell>Not have data</Table.Cell>
            </Table.Row>
    };

    render() {
        const {column, sortedData, direction} = this.state.listData;
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
                                    <Table sortable celled fixed compact='very'>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell onClick={this.sort("date")}
                                                                  sorted={column === 'date' ? direction : null}>Date of
                                                    creating</Table.HeaderCell>
                                                <Table.HeaderCell onClick={this.sort("type")}
                                                                  sorted={column === 'type' ? direction : null}>Type of
                                                    backup</Table.HeaderCell>
                                                <Table.HeaderCell onClick={this.sort("volumes")}
                                                                  sorted={column === 'volumes' ? direction : null}>Number
                                                    of added volumes</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {sortedData ? this.renderTable(sortedData) : <Table.Row>
                                                <Table.Cell>Not any backup data yet</Table.Cell></Table.Row>}
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
                                    <TextArea readOnly  value={this.state.backupLogs} style={{height: 550, resize: "none"}}/>

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