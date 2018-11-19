let express = require("express");
let app = express();
let http = require('http').Server(app);
let auth = require("http-auth");
let path = require('path');
let authPolicy = require("./controllers/PolicyController");
let exec = require("./controllers/OperationsController");
let io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log("socket open");
    socket.on("createRestore", (time) => {
        try {
            exec.restoreBackup({time, io})
        }
        catch (e) {
            console.log(e)
        }
    });
    socket.on("createBackup", (time) => {
        try {
            exec.createBackup({time, io})

        } catch (e) {
            console.log(e)
        }
    });
    socket.on("disconnect", () => {
        console.log("socket closed");
    });
    socket.on("sendPassphrase", data => {
        process.env.PASSPHRASE = data.trim();
        exec.socketExec(exec.command, io, exec.args);
    });
    socket.on("getAppState", () => {
        socket.emit("appState", exec.state)
    })

});
app.use(auth.connect(authPolicy.AuthPolicy));
app.use(express.static(path.join(__dirname, "../build")));
app.get("/docker", (req, res) => {
    res.set({'Access-Control-Allow-Origin': "*"});
    exec.getBackupsList(res).then((data) => {
        res.json(data)
    })
});
http.listen(process.env.PORT || 5001, console.log("Listen server " + process.env.PORT || 5001));