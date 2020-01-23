const bcrypt = require("bcrypt");
const saltRounds = 3;


let x =''

const pass=bcrypt.hash('admin', saltRounds, function(err, hash) {
      //encrypts the password
      x = hash; //stores the encrpted pw in users obj
      console.log(x)
});


console.log(pass)

  