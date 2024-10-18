const Sequelize = require('sequelize')

const banco = new Sequelize ("doacao", "root", "", {
    host:"localhost",
    dialect: 'mysql'
})

// banco.authenticate().then(function () {
//     console.log('Conexão OK')
// }).catch(function (err) {
//     console.log("Erro ao conectar com o banco de dados: " + err);
//   });
const Postagem = banco.define("postagens", {
    titulo: {
        type: Sequelize.STRING,
    },
    conteudo: {
        type: Sequelize.TEXT
    }
});
// Postagem.sync({force: true})

Postagem.create({
    titulo: 'Uma aleatória',
    conteudo: 'BLABLABLA'
});