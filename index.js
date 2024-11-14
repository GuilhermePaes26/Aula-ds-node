const express = require("express");
const Sequelize = require("sequelize");
const { create } = require("express-handlebars");
const path = require("path");
const upload = require("./config/multerConfig");
const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const banco = new Sequelize("doacao", "root", "Gui26*", {
  host: "localhost",
  dialect: "mysql",
});

const Cliente = banco.define("cliente", {
  id_clie: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nm_clie: {
    type: Sequelize.TEXT,
  },
  cpf_clie: {
    type: Sequelize.TEXT,
  },
  senha_clie: {
    type: Sequelize.TEXT,
  },
});

const Produto = banco.define("produto", {
  id_prod: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome_prod: {
    type: Sequelize.TEXT,
  },
  estado_prod: {
    type: Sequelize.TEXT,
  },
  descricao_prod: {
    type: Sequelize.TEXT,
  },
  imagem: {
    type: Sequelize.STRING,
  },
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
      key: "id_clie",
    },
  },
  id_prod: {
    type: Sequelize.INTEGER,
    references: {
      model: Produto,
      key: "id_prod",
    },
  },
  data_doa: {
    type: Sequelize.TEXT,
  },
  qndt_doa: {
    type: Sequelize.TEXT,
  },
  reserva_doa: {
    type: Sequelize.BOOLEAN,
  },
});

async function createBD() {
  await Cliente.sync();
  await Produto.sync();
  await Doacao.sync();
}
createBD();

//Relações
Doacao.belongsTo(Cliente, { foreignKey: "id_clie", as: "cliente" });
Cliente.hasMany(Doacao, { foreignKey: "id_clie" });

Doacao.belongsTo(Produto, { foreignKey: "id_prod", as: "produto" });
Produto.hasMany(Doacao, { foreignKey: "id_prod" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const abs = create({ defaultLayout: "main" });
app.engine("handlebars", abs.engine);
app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/cadastro", (req, res) => {
  res.render("form");
});

app.post("/cadastro", async function (req, res) {
  try {
    const { nm_clie, cpf_clie, senha_clie } = req.body;
    const novaDoacao = await Cliente.create({
      nm_clie,
      cpf_clie,
      senha_clie,
    });
    res.sendFile(__dirname + "/html/index.html");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rotas de CRUD para Cliente

// Criar Cliente
app.post("/cliente", async (req, res) => {
  try {
    const { nm_clie, cpf_clie, senha_clie } = req.body;
    const novoCliente = await Cliente.create({
      nm_clie,
      cpf_clie,
      senha_clie,
    });
    res.json(novoCliente);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Buscar Cliente pelo CPF
app.get("/cliente/find/:cpf_clie", async (req, res) => {
  try {
    const { cpf_clie } = req.params;
    const cliente = await Cliente.findOne({ where: { cpf_clie } });
    if (!cliente) {
      return res.status(404).send("Cliente não encontrado.");
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Atualizar Cliente

app.get("/update/cliente/:id_clie", async (req, res) => {
  try {
    const { id_clie } = req.params;
    const cliente = await Cliente.findOne({ where: { id_clie } });
    if (!cliente) {
      return res.status(404).send("Cliente não encontrado.");
    }
    const clientePlano = Object.assign({}, cliente.get());
    res.render("editar_cliente", { cliente: clientePlano });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/update/cliente/:id_clie", async (req, res) => {
  try {
    const { id_clie } = req.params;
    const { nm_clie, cpf_clie, senha_clie } = req.body;

    const cliente = await Cliente.findOne({ where: { id_clie } });
    if (!cliente) {
      return res.status(404).send("Cliente não encontrado.");
    }

    cliente.nm_clie = nm_clie || cliente.nm_clie;
    cliente.cpf_clie = cpf_clie || cliente.cpf_clie;
    cliente.senha_clie = senha_clie || cliente.senha_clie;

    await cliente.save();
    res.json(cliente);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Deletar Cliente
app.delete("/delete/cliente/:id_clie", async (req, res) => {
  try {
    const { id_clie } = req.params;
    const cliente = await Cliente.destroy({ where: { id_clie } });
    if (!cliente) {
      return res.status(404).send("Cliente não encontrado.");
    }
    res.json({ message: "Cliente deletado com sucesso." });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rotas de CRUD para Produto

// Criar Produto

app.get("/produtos", async (req, res) => {
  try {
    const produtos = await Produto.findAll({ raw: true });
    res.render("produto/produtos", { produtos: produtos }); // Passa os produtos para o template Handlebars
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/produto/novo", (req, res) => {
  res.render("produto/form_produto");
});

// Rota para editar produto
app.get("/produto/editar/:id_prod", async (req, res) => {
  const { id_prod } = req.params;
  try {
    const produto = await Produto.findOne({ where: { id_prod } });
    if (!produto) {
      return res.status(404).send("Produto não encontrado.");
    }
    res.render("produto/editar_produto", { produto: produto.dataValues });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para exibir detalhes do produto
app.get("/produto/:id_prod", async (req, res) => {
  const { id_prod } = req.params;
  try {
    const produto = await Produto.findOne({ where: { id_prod } });
    if (!produto) {
      return res.status(404).send("Produto não encontrado.");
    }
    const produtoData = produto.get();
    if (produtoData.imagem) {
      produtoData.imagemUrl = `/uploads/${produtoData.imagem}`;
    }
    res.render("produto/produto", { produto: produtoData });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para criar produto (POST)
app.post("/produto", upload.single("imagem"), async (req, res) => {
  const { nome_prod, estado_prod, descricao_prod } = req.body;
  const imagem = req.file ? req.file.filename : null;

  try {
    const novoProduto = await Produto.create({
      nome_prod,
      estado_prod,
      descricao_prod,
      imagem,
    });

    res.redirect(`/produto/${novoProduto.id_prod}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para atualizar produto (POST)
app.post("/update/produto/:id_prod", upload.single("imagem"), async (req, res) => {
  const { id_prod } = req.params;
  const { nome_prod, estado_prod, descricao_prod } = req.body;
  const imagem = req.file ? req.file.filename : null;

  try {
    const produto = await Produto.findOne({ where: { id_prod } });
    if (!produto) {
      return res.status(404).send("Produto não encontrado.");
    }

    // Atualizar os campos do produto
    produto.nome_prod = nome_prod;
    produto.estado_prod = estado_prod;
    produto.descricao_prod = descricao_prod;
    if (imagem) {
      produto.imagem = imagem;
    }

    await produto.save();
    res.redirect(`/produto/${id_prod}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para deletar produto (DELETE)
app.post("/delete/produto/:id_prod", async (req, res) => {
  const { id_prod } = req.params;
  try {
    const produto = await Produto.destroy({ where: { id_prod } });
    if (!produto) {
      return res.status(404).send("Produto não encontrado.");
    }
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rotas de CRUD para Doação

// Listar todas as doações de um cliente
app.get("/doacao/find/:id_clie", async (req, res) => {
  try {
    const { id_clie } = req.params;
    const doacoes = await Doacao.findAll({
      where: { id_clie },
      include: [
        { model: Cliente, as: "cliente" },
        { model: Produto, as: "produto" },
      ],
    });

    if (!doacoes || doacoes.length === 0) {
      return res.status(404).send("Nenhuma doação encontrada.");
    }

    const doacoesPlain = doacoes.map((doacao) => doacao.get({ plain: true }));

    res.render("doacoes/lista", { doacoes: doacoesPlain });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Página para criar uma nova doação]

app.get("/doacao/novo", async (req, res) => {
  try {
    // Carrega todos os clientes e produtos
    const clientes = await Cliente.findAll();
    const produtos = await Produto.findAll();

    const clientesPlain = clientes.map((cliente) => cliente.get({ plain: true }));
    const produtosPlain = produtos.map((produto) => produto.get({ plain: true }));
    res.render("doacoes/novo", { clientes: clientesPlain, produtos: produtosPlain });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota POST para criar a doação
app.post("/doacao/novo", async (req, res) => {
  try {
    const { id_clie, id_prod, data_doa, qndt_doa, reserva_doa } = req.body;
    const novaDoacao = await Doacao.create({
      id_clie,
      id_prod,
      data_doa,
      qndt_doa,
      reserva_doa,
    });
    res.redirect(`/doacoes`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

function cleanData(data) {
  if (!data) {
    throw new Error("Doação não encontrada");
  }

  return {
    ...data.dataValues,
    cliente: data.cliente ? data.cliente.dataValues : null,
    produto: data.produto ? data.produto.dataValues : null,
  };
}
app.get("/doacao/detalhes/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;

    const doacao = await Doacao.findOne({
      where: { id_doacao },
      include: [
        { model: Cliente, as: "cliente" },
        { model: Produto, as: "produto" },
      ],
    });

    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    const cleanedDoacao = cleanData(doacao);

    res.render("doacoes/detalhes", { doacao: cleanedDoacao });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/doacao/editar/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;
    const doacao = await Doacao.findOne({
      where: { id_doacao },
      include: [
        { model: Cliente, as: "cliente" },
        { model: Produto, as: "produto" },
      ],
    });

    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    const cleanedDoacao = cleanData(doacao);

    const clientes = await Cliente.findAll();
    const produtos = await Produto.findAll();

    res.render("doacoes/editar", { doacao: cleanedDoacao, clientes, produtos });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota POST para atualizar a doação
app.post("/update/doacao/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;
    const { qndt_doa, reserva_doa } = req.body;

    const doacao = await Doacao.findOne({ where: { id_doacao } });
    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    doacao.qndt_doa = qndt_doa || doacao.qndt_doa;
    doacao.reserva_doa = reserva_doa !== undefined ? reserva_doa : doacao.reserva_doa;

    // Salva as alterações
    await doacao.save();

    const cleanedDoacao = cleanData(doacao);

    res.redirect(`/doacao/detalhes/${cleanedDoacao.id_doacao}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Confirmar exclusão de uma doação
app.get("/delete/doacao/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;
    const doacao = await Doacao.findOne({
      where: { id_doacao },
      include: [
        { model: Cliente, as: "cliente" },
        { model: Produto, as: "produto" },
      ],
    });

    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    const cleanedDoacao = cleanData(doacao); // Limpar os dados para exibição

    res.render("doacoes/confirmar_delete", { doacao: cleanedDoacao });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Excluir a doação
app.post("/delete/doacao/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;
    const doacao = await Doacao.findOne({ where: { id_doacao } });

    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    const cleanedDoacao = cleanData(doacao);

    // Exclui a doação
    await Doacao.destroy({ where: { id_doacao } });

    res.redirect(`/doacoes`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/alterar/reserva/:id_doacao", async (req, res) => {
  try {
    const { id_doacao } = req.params;
    const doacao = await Doacao.findOne({ where: { id_doacao } });

    if (!doacao) {
      return res.status(404).send("Doação não encontrada.");
    }

    doacao.reserva_doa = !doacao.reserva_doa;
    await doacao.save();

    res.redirect(`/doacoes`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// todas as doacoes
app.get("/doacoes", async (req, res) => {
  try {
    const doacoes = await Doacao.findAll({
      include: [
        { model: Cliente, as: "cliente" },
        { model: Produto, as: "produto" },
      ],
    });

    if (!doacoes || doacoes.length === 0) {
      return res.status(404).send("Nenhuma doação encontrada.");
    }

    const doacoesPlain = doacoes.map((doacao) => doacao.get({ plain: true }));

    res.render("doacoes/lista-complete", { doacoes: doacoesPlain });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3031, () => {
  console.log("Servidor rodando em http://localhost:3031");
});
