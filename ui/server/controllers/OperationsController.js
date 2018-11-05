const _ = require("lodash");
const moment = require("moment");
const util = require('util');
const exec = util.promisify(require("child_process").exec);

let execWrapper = {
        promisifyStream(data) {
            return new Promise((resolve, reject) => {
                if (data.stderr!==''){
                    resolve(data.stderr.toString())
                    return 0;}
                //let text = '';
                resolve(data.stdout)
            });
        },
        promisifySocketStream(data, io) {
            return new Promise((resolve, reject) => {
                if (data.stderr!=='') {
                    io.emit("log",data.stderr).then(()=>{resolve(data.stderr);})
                    return 0;
                }
                io.emit("log", data.stdout.toString()).then(() => {
                    resolve(data.stdout)
                });

            });
        },
        getBackupsList(res) {
            let command = ['list'];
            this.dockerContainerExec(command).then(data => {
                this.sliceBackupList(data, res)
            });
        },
        createBackup(io) {
            let command = ["backup"];
            return this.dockerContainerExec(command,io)
        },
        restoreBackup({time, io}) {
            let command = ['restore', '--dry-run'];
            if (time) {
                _.concat(command, "-t", moment(time.trim(), "YYYY-MMM-DDTHH:mm:ss").unix());
            }
            return this.dockerContainerExec(command, io)
        },
        sliceBackupList(data, res) {
            console.log(typeof(data))
            console.log(data);
            let beginPos = data.search("Num volumes:");
            data = data.slice(beginPos);
            let endPos = data.search("-------------------------");
            data = data.slice(0, endPos);
            let firstPost = data.search(":");
            data = data.slice(firstPost + 3);
            res.json(data)
        },
        dockerContainerExec(command, io) {
            return exec(command.join(" "))
                .then((data) => io ? this.promisifySocketStream(data,io) : this.promisifyStream(data)).catch(err => {
                    io?io.emit("log",err.stdout):console.log(err)
                })
        }
    }
;

module.exports = execWrapper;
