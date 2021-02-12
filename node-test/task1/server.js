const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/sequelize');
const errorMiddleware=require("./middleware/error")


// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// Body parser
app.use(express.json());



const PORT = process.env.PORT || 5000;

//static files
app.use(express.static("./public"))


sequelize.sync().then(()=>{
    app.listen(5000, function(){
        console.log("Database is connected...");
    });
}).catch(err=>console.log(err));

// Route files
const auth = require('./routes/auth');
const file=require("./routes/file");

// Mount routers
app.use('/api/auth', auth);
app.use('/api/file', file);

//errorMiddleware
app.use(errorMiddleware);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
