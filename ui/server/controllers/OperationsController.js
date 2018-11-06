const _ = require("lodash");
const moment = require("moment");
const util = require('util');
const spawn = require("child_process").spawn;
const exec = util.promisify(require('child_process').exec);
let execWrapper = {

        getBackupsList(res) {
            let command = ['list'];
            return this.ajaxExec(command).then((stdout, stderr) => {
                return this.sliceBackupList(stdout, res)
            });
        },
        createBackup(io) {
            this.socketExec("backup", io)
        },
        restoreBackup({time, io}) {
            let args = ['--dry-run'];
            if (time) {
                _.concat(args, "-t", moment(time.trim(), "YYYY-MMM-DDTHH:mm:ss").unix());
            }
            this.socketExec("restore", io, args)
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
            io.on("sendPasspharse", data => {
                spawn.stdin.write(data.trim())
            });
            spawnedProcess.stdout.on("data", data => {
                data.toString().search("passphrase") !== -1 ? io.emit("enterPassphrase") : null;
                this.emitLogs(io, data)
            });
            spawnedProcess.stderr.on("data", data => {
                this.emitLogs(io, data)
            });
            spawnedProcess.on("error", err => {
                this.emitLogs(io, err);
                io.emit("error" + command.capitalize())
            });
            spawnedProcess.on("exit", code => {
                io.emit("log", "\n");
                io.emit(command.toLowerCase()+"Complete", code)
            });

        },
        emitLogs(io, data) {
            io.emit("log", data.toString().trim().split("\n").map((value, index, array) => {
                return moment().format("DD/MM/YYYY HH:mm:ss") + " " + value
            }).join("\n").trim())
        },
        async ajaxExec(command) {
            return await exec(command.join(" "))
        }
    }
;

module.exports = execWrapper;
