const glob = require('glob')

const result = glob.sync('./app/src/controller//**/*.{ts,js}')
console.log(result)