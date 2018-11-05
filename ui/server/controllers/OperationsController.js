const _ = require("lodash");
const moment = require("moment");
const util = require('util');
const spawn = require("child_process").spawn;
const exec = util.promisify(require('child_process').exec);
let execWrapper = {

        getBackupsList(res) {
            let command = ['list'];
            return this.ajaxExec(command).then((stdout, stderr)=>{return this.sliceBackupList(stdout, res)});
        },
        createBackup(io) {
            let command = ["backup"];
            this.socketExec(command, io)
        },
        restoreBackup({time, io}) {
            let command = ['restore', '--dry-run'];
            if (time) {
                _.concat(command, "-t", moment(time.trim(), "YYYY-MMM-DDTHH:mm:ss").unix());
            }
            this.socketExec(command, io)
        },
        sliceBackupList(data, res) {
            let beginPos = data.search("Num volumes:");
            data = data.slice(beginPos);
            let endPos = data.search("-------------------------");
            data = data.slice(0, endPos);
            let firstPost = data.search(":");
            data = data.slice(firstPost + 3);
            return data
        },
        socketExec(command, io) {
            let logBody = "";
            let spawnedProcess = spawn(command.join(" "), {stdio: 'pipe'});
            spawnedProcess.stdout.on("data", data => {
                logBody += data.toString();
                io.emit("log", logBody)
            });
            spawnedProcess.stderr.on("data", data => {
                logBody += data.toString();
                io.emit("log", logBody)
            });
            spawnedProcess.on("error", err => {
                logBody += err.toString();
                io.emit("log", logBody)
            });
            spawnedProcess.on("exit", code => {
                logBody += "Exit with code: " + code.toString();
                io.emit("log", logBody)
            });

        },
        async ajaxExec(command) {
            return await exec(command.join(" "))
        }
    }
;

module.exports = execWrapper;
