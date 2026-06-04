let mongoose = require('mongoose'); //ODM  = object data model
let config = require('./config.js');

mongoose.set('strictQuery', true);
mongoose.connect(config.getUrl()).then(()=>console.log("Conectado a la base de datos"))
  .catch((err)=>console.log("no conectado", err.message))

  
module.exports = mongoose;

