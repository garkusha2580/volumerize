const auth = require("http-auth");
let AuthPolicy = auth.basic(
    {realm:"basic auth test",
    },(usr,pass,call)=>{
        call(usr==="admin"&&pass==="admin");
    }
);

module.exports={AuthPolicy:AuthPolicy};