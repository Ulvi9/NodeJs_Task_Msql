const sequelize = require('../config/sequelize');
const Sequelize=require('sequelize');

const File = sequelize.define("file", {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    extension: {
        type: Sequelize.STRING,
        allowNull: false
    },
    mimeType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    size: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports=File;