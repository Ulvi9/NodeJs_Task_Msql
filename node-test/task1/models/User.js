const sequelize = require('../config/sequelize');
const Sequelize=require('sequelize');
const bcrypt = require("bcryptjs");

const User = sequelize.define("user", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address",
            }
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

});
User.beforeCreate((user, options) => {

    return bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
        })
        .catch(err => {
            throw new Error();
        });
});

module.exports=User;