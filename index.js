const express = require('express');
var cors = require('cors')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const envConfigs = require('./config');

const env = process.env.NODE_ENV || 'development';
const config = envConfigs[env];

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

mongoose.connect(
    config.dbConnection,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    },
    (error) => {
        if (error !== null) {
            console.log(error);
            return;
        }
        console.log("connected to Database");
    }
);

const accountRoutes = require('./routes/account_routes');
const authRoutes = require('./routes/authentication_routes');

const app = express();
app.use(express.json());
const corsConfig = {
    origin: true,
    credentials: true,
};
  
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(cookieParser(process.env.COOKIE_SECRET));


// Routes
// TODO: Find a way to append version to all routes
app.use('/accounts', accountRoutes);
app.use('/auth', authRoutes);

const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`Server up and running on port ${port}`));