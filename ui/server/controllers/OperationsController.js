const _ = require("lodash");
const moment = require("moment");
const util = require('util');
const spawn = require("child_process").spawn;
const exec = util.promisify(require('child_process').exec);

let execWrapper = {
        state: "ready",
        args: [],
        command: "",
        getBackupsList(res) {
            this.command = 'list';
            return this.ajaxExec(this.command).then((stdout, stderr) => {
                return this.sliceBackupList(stdout, res)
            });
        },
        createBackup(obj) {
            this.command = "backup";
            this.args=[];
            this.socketExec(this.command, obj.io, this.args)
        },
        restoreBackup({time, io}) {
            this.command = "restore";
            if (time) {
                _.concat(this.args, "-t", moment(time.trim(), "YYYY-MMM-DDTHH:mm:ss").unix());
            }
            if (process.env.VOLUMERIZE_GPG_PRIVATE_KEY && !process.env.PASSPHRASE) {
                io.emit("enterPassphrase");
            } else {
                this.socketExec(this.command, io, this.args)
            }

        },
        sliceBackupList(stream, res) {
            let data = stream.stdout.toString();
            let beginPos = data.search("Num volumes:");
            data = data.slice(beginPos);
            let endPos = data.search("-------------------------");
            data = data.slice(0, endPos);
            let firstPost = data.search(":");
            data = data.slice(firstPost + 3);
            return data
        },
        socketExec(command, io, args) {

            let spawnedProcess = spawn(command, args, {stdio: 'pipe'});
            spawnedProcess.stdout.on("data", data => {
                this.setProgress();
                this.emitLogs(io, data, command)
            });
            spawnedProcess.stderr.on("data", data => {
                this.setProgress();
                this.emitLogs(io, data, command)
            });
            spawnedProcess.on("error", err => {
                this.setReady();
                this.emitLogs(io, err, command);
                io.emit(command.lowerCase() + "Error");
                io.emit("appState", this.state)

            });
            spawnedProcess.on("exit", code => {
                this.setReady();
                io.emit("log", "\n");
                io.emit(command.toLowerCase() + "Complete", code);
                io.emit("appState", this.state)

            });
        },
        emitLogs(io, data, command) {
            io.emit(command + "Log", data.toString().trim().split("\n").map((value, index, array) => {
                return moment().format("DD/MM/YYYY HH:mm:ss") + " " + value
            }).join("\n").trim())
        },
        async ajaxExec(command) {
            return await exec(command)
        },
        setReady() {
            this.state = true
        },
        setProgress() {
            this.state = false
        },
    }
;

module.exports = execWrapper;
