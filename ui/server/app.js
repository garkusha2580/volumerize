let express = require("express");
let app = express();
let http = require('http').Server(app);
let auth = require("http-auth");
let path = require('path');
let authPolicy = require("./controllers/PolicyController");
let exec = require("./controllers/OperationsController");
let io = require('socket.io')(http);
io.on('connection', (socket) => {
    console.log("connected");
    socket.on("createRestore", (time) => {
        exec.restoreBackup({time, io})
    });
    socket.on("createBackup", (time) => {
        exec.createBackup({time, io})
    });
    socket.on("disconnect",()=>{
        console.log("socket closed");
    })
});

app.use(auth.connect(authPolicy.AuthPolicy));
app.use(express.static(path.join(__dirname, "../build")));
app.get("/docker",(req, res) => {
    res.set({'Access-Control-Allow-Origin': "*"});
    exec.getBackupsList(res).then((data)=>{
        res.json(data)})
});

http.listen(process.env.PORT||5001, console.log("Listen server "+process.env.PORT||5001));