
const express = require("express");

const app = express();

const Sequelize = require('sequelize')

const { create } = require("express-handlebars");

const banco = new Sequelize ("doacao", "root", "", {
    host:"localhost",
    dialect: 'mysql'
})

const Cliente = banco.define("cliente", {
    id_clie: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nm_clie: {
        type: Sequelize.TEXT
    },
    cpf_clie: {
        type: Sequelize.TEXT
    },
    senha_clie: {
        type: Sequelize.TEXT
    }
});

const Produto = banco.define("produto", {
    id_prod: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome_prod: {
        type: Sequelize.TEXT
    },
    estado_prod: {
        type: Sequelize.TEXT
    },
    descricao_prod: {
        type: Sequelize.TEXT
    }
});


const Doacao = banco.define("doacaos", {
    id_doacao: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_clie: {
        type: Sequelize.INTEGER, 
        references: {
            model: Cliente,
            key: 'id_clie'
        }
    },
    id_prod: {
        type: Sequelize.INTEGER, 
        references: {
            model: Produto,
            key: 'id_prod'
        }
    },
    data_doa: {
        type: Sequelize.TEXT
    },
    qndt_doa: {
        type: Sequelize.TEXT
    },
    reserva_doa: { 
        type: Sequelize.BOOLEAN
    },
});
async function createBD() {
    await Cliente.sync()
    await Produto.sync() 
    await Doacao.sync() 
}
createBD()

//ROTAS:

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
});

 app.get("/cad", function (req, res) {
    //res.send("Rota de cadastro de postagem");
    res.render("form"); //renderizando a pagina form.handlebars
  });
app.post("/cadastro", async function (req, res) {
    try {
        const { nm_clie, cpf_clie, senha_clie } = req.body;

        const novaDoacao = await Cliente.create({
            nm_clie,
            cpf_clie,
            senha_clie
        });

        res.sendFile(__dirname + '/html/index.html'); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});


const abs = create({ defaultLayout: "main" }); //definindo layout padrão
app.engine("handlebars", abs.engine); //denfinindo o motor e o recheio 
app.set("view engine", "handlebars");
// Iniciar o servidor
app.listen(3031, () => {
    console.log("Servidor rodando em http://localhost:3031");
});

  
// app.get("/produto/:nome_prod/:estado_prod/:descricao_prod", async function (req, res) {
//     // Para teste  http://localhost:3031/produto/Mario-boneco/Novo/Boneco Irado do Mario
//     try {
//         const { nome_prod, estado_prod, descricao_prod } = req.params; 

//         const novoProduto = await Produto.create({
//             nome_prod,
//             estado_prod,
//             descricao_prod
//         });

//         res.json(novoProduto); 
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// app.get("/doacao/:id_clie/:id_prod/:data_doa/:qndt_doa/:booleano_doa", async function (req, res) {
//     // Para teste  http://localhost:3031/doacao/1/1/23-10-24/50/false
//     try {
//         const { id_clie, id_prod, data_doa, booleano_doa, qndt_doa } = req.params;
//         const novaDoacao = await Doacao.create({
//             id_clie,
//             id_prod,
//             data_doa,
//             qndt_doa,
//             reserva_doa: booleano_doa === 'true',
//         });
//         res.json(novaDoacao);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// // Ler 

// app.get("/cadastro/:cpf_clie/", async function (req, res) {
//     // http://localhost:3031/cadastro/12345678901/
//      try {
//          const { cpf_clie } = req.params;
//          const User = await Cliente.findOne({where : {cpf_clie}})
//          res.json(User);
//      } catch (error) {
//          res.status(500).send(error.message);
//      }
//  });
 
   
//  app.get("/produto/:nome_prod", async function (req, res) {
//      // Para teste  http://localhost:3031/produto/Mario-boneco/
//      try {
//         const { nome_prod } = req.params;
//         const produto = await Produto.findOne({where : {nome_prod}})
//         res.json(produto);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
//  });
 
//  app.get("/doacao/:id_clie", async function (req, res) {
//      // Para teste  http://localhost:3031/doacao/1
//      try {
//          const { id_clie } = req.params;
//          const findDoacao = await Doacao.findOne({where : {id_clie}}
//          );
//          res.json(findDoacao);
//      } catch (error) {
//          res.status(500).send(error.message);
//      }
//  });

// // Atualizar

// app.get("/update/cadastro/:id_clie/:nome_clie", async function (req, res) {
//     // Para teste: http://localhost:3031/update/cadastro/1/Maria Clébia
//     try {
//         const { id_clie, nome_clie } = req.params;
        
//         const User = await Cliente.findOne({ where: { id_clie } });
        
//         if (!User) {
//             return res.status(404).send("Cliente não encontrado.");
//         }

//         User.nm_clie = nome_clie; 
//         await User.save(); 

//         res.json(User);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });
 
   
//  app.get("/produto/:id_prod/nome_prod", async function (req, res) {
//      // Para teste  http://localhost:3031/produto/Mario-boneco/
//      try {
//         const { nome_prod } = req.params;
//         const produto = await Produto.findOne({where : {nome_prod}})
//         res.json(produto);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
//  });
 
//  app.get("/doacao/:id_doa/:qndt_doa", async function (req, res) {
//      // Para teste  http://localhost:3031/doacao/1
//      try {
//          const { id_clie } = req.params;
//          const findDoacao = await Doacao.findOne({where : {id_clie}}
//          );
//          res.json(findDoacao);
//      } catch (error) {
//          res.status(500).send(error.message);
//      }
//  });

//  // Delete 
//  app.get("/delete/cadastro/:id_clie/", async function (req, res) {
//     // Para teste: http://localhost:3031/update/cadastro/1/Maria Clébia
//     try {
//         const { id_clie } = req.params;
        
//         const var_delete = await Cliente.destroy({ where: { id_clie } });
        
//         if (!var_delete) {
//             return res.status(404).send("Cliente não encontrado.");
//         }
//         res.json('Cliente deletado');
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// app.get("/delete/produto/:id_prod/", async function (req, res) {
//     // Para teste: http://localhost:3031/update/cadastro/1/Maria Clébia
//     try {
//         const { id_prod } = req.params;
        
//         const var_delete = await Produto.destroy({ where: { id_prod } });
        
//         if (!var_delete) {
//             return res.status(404).send("Produto não encontrado.");
//         }
//         res.json('Produto deletado');
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

// app.get("/delete/doacao/:id_doacao/", async function (req, res) {
//     // Para teste: http://localhost:3031/update/cadastro/1/Maria Clébia
//     try {
//         const { id_doacao } = req.params;
        
//         const var_delete = await Doacao.destroy({ where: { id_doacao } });
        
//         if (!var_delete) {
//             return res.status(404).send("Doacao não encontrado.");
//         }
//         res.json('Doacao deletado');
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });
 
// app.listen(3031, function () {
//   console.log("Server is running on port 3031");
// });