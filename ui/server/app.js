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

    /// Creating events
    socket.on("createRestore", async (time) => {
        exec.restoreBackup({time, io});
        socket.emit("appState", exec.state)
    });
    socket.on("createBackup", async (time) => {
        exec.createBackup({time, io});
        socket.emit("appState", exec.state)
    });

    socket.on("cancelPasspharse", async () => {
        socket.emit("Success", exec.state)
    });

    /// Getting events
    socket.on("getBackupList", async (refresh) => {
        socket.emit("startGetBackupList");
        try {
            exec.getBackupsList(io, refresh).then((data) => {
                setTimeout(()=>{socket.emit("backupList", data)},2000);
            });
        }
        catch (e) {
            console.log(e)
        }
    });

    socket.on("getAppState", async () => {
        socket.emit("appState", exec.state)
    });

    socket.on("getEnvData", async () => {
        process.env.VOLUMERIZE_SERVICES && !exec.envData.envName
            ? exec.getEnvData(io)
            : socket.emit("envData", exec.envData);
    });

    /// Set events
    socket.on("sendPassphrase", data => {
        process.env.PASSPHRASE = data.trim();
        exec.socketExec(exec.command, io, exec.args);
        process.env.PASSPHRASE = "";
    });

    socket.on("disconnect", async () => {
        console.log("socket closed");
    });

});

app.use(auth.connect(authPolicy.AuthPolicy));

app.use(express.static(path.join(__dirname, "../build")));
let port = process.env.PORT || 5001;
http.listen(port, console.log("Listen server " + port));