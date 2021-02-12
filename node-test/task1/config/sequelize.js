const Sequelize=require('sequelize');

const sequelize = new Sequelize("taskMySql", "misir", "misir", {
    dialect: "mysql",
    host: "localhost"
});

module.exports=sequelize;
