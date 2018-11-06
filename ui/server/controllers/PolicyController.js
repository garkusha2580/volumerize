const auth = require("http-auth");
let AuthPolicy = auth.basic(
    {
        realm: "basic auth test",
    }, (usr, pass, call) => {
        let usrLogin = process.env.UI_LOGIN || "admin";
        let usrPass = process.env.UI_PASS || "admin";
        call(usr === usrLogin && pass === usrPass);
    }
);

module.exports = {AuthPolicy: AuthPolicy};