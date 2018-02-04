// --> console
// export NODE_ENV=production 

// ---> code
// process.env.NODE_ENV = 'production'; 

// ps 
// kill -9 11066
// kill -9 node 

module.exports = require('./' + (process.env.NODE_ENV || 'development') + '.json' );
