import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";

const app = express();

app.use(express.json());
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Servidor inicializado e rodando na PORT: ${port}`);
});

let userId: number = 3;
class User {
  public id: number;
  public name: string;
  public cpf: string;
  public email: string;
  public age: number;

  public transactions: Array<Transaction>;

  constructor(
    id: number,
    name: string,
    cpf: string,
    email: string,
    age: number,
    transactions: Array<Transaction>
  ) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
    this.email = email;
    this.age = age;
    this.transactions = transactions;
  }
}
const users: Array<User> = [
  new User(0, "Paulo", "000000000-01", "teste@paulo.com", 25, []),
  new User(1, "Cezar", "000000000-02", "teste@cezar.com", 27, []),
  new User(2, "Maria", "000000000-03", "teste@maria.com", 32, []),
];

let idTransaction: number = 0;
class Transaction {
  public id: number;
  public title: string;
  public value: number;
  public type: string;

  constructor(id: number, title: string, value: number, type: string) {
    this.id = id;
    this.title = title;
    this.value = value;
    this.type = type;
  }
}
app.post("/users", (req: Request, res: Response) => {
  const name = String(req.body.name);
  const cpf = String(req.body.cpf);
  const email = String(req.body.email);
  const age = Number(req.body.age);

  if (age === Number("") || name === "" || cpf === "" || email === "") {
    res.status(400).send("Preencha todos os campos!");
  } else {
    const verCpf = users.findIndex((user) => user.cpf == cpf);
    const verEmail = users.findIndex((user) => user.email == email);

    if (verEmail == -1 && verCpf == -1) {
      const novaPessoa: User = new User(userId, name, cpf, email, age, []);
      users.push(novaPessoa);
      userId++;
      res.status(201).json(novaPessoa);
      console.log(users);
    } else {
      res.status(400).send("Erro nas informações do usuário.");
    }
  }
});

app.get("/users", (req: Request, res: Response) => {
  res.json(users);
});

app.get("/users/:id", (req: Request, res: Response) => {
  const idProcurado: number = Number(req.params.id);
  let idEncontrado: User | undefined = users.find(
    (pessoa) => pessoa.id == idProcurado
  );
  res.send(idEncontrado);
});

app.put("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const name = String(req.body.name);
  const cpf = String(req.body.cpf);
  const email = String(req.body.email);
  const age: number = Number(req.body.age);

  let indiceUsuario: number = users.findIndex((pessoa) => pessoa.id == id);

  if (indiceUsuario > -1) {
    if (name != "undefined") users[indiceUsuario].name = name;
    if (cpf != "undefined") users[indiceUsuario].cpf = cpf;
    if (email != "undefined") users[indiceUsuario].email = email;
    if (!isNaN(age)) users[indiceUsuario].age = age;
    res.status(201).json(users[indiceUsuario]);
  } else {
    res.status(400).send("Usuário não encontrado.");
  }
});

app.delete("/users/:id", (req: Request, res: Response) => {
  const id: number = Number(req.params.id);

  let indiceUsuario: number = users.findIndex((pessoa) => pessoa.id == id);

  if (indiceUsuario > -1) {
    res.status(201).send(users.splice(indiceUsuario, 1));
  } else {
    res.status(400).send("Id não encontrado.");
  }
});

app.post("/users/:userId/transactions", (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const title = String(req.body.title);
  const value = Number(req.body.value);
  const type = String(req.body.type);

  if (title == "" || value == Number("") || type == "") {
    res.status(400).send("Preencha todos os campos!");
  } else {
    if (type == "outcome" || type == "income") {
      const operacao = new Transaction(idTransaction, title, value, type);
      users[userId].transactions.push(operacao);
      idTransaction++;
      res.status(201).send("Operação realizada com sucesso");
    } else {
      res.status(400).send("Não foi possível realizar a operação");
    }
  }
});

app.get("/users/:userId/transactions/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const idTransaction = Number(req.params.id);

  const usersId = users.findIndex((user) => user.id == userId);
  const IdTransactions = users[userId].transactions.findIndex(
    (user) => user.id == idTransaction
  );
  if (usersId > -1) {
    if (IdTransactions > -1) {
      res.status(200).send(users[usersId].transactions[idTransaction]);
    } else {
      res
        .status(400)
        .send(
          `Não foi possível encontrar a transação com id: ${idTransaction}`
        );
    }
  } else {
    res
      .status(400)
      .send(`Não foi possível encontrar o usuário com id: ${usersId}`);
  }
});

const outcomeLista: Array<number> = [];
const incomeLista: Array<number> = [];
app.get("/users/:userId/transactions", (req: Request, res: Response) => {
  const id = Number(req.params.userId);
  const userId = users.findIndex((user) => user.id == id);
  const reducer = (acumulador: any, valorAtual: any) => acumulador + valorAtual;
  if (userId > -1) {
    let outcome = users[userId].transactions.findIndex(
      (user) => user.type == "outcome"
    );
    outcomeLista.push(Number(users[userId].transactions[outcome].value));
    const outcomeTotal: number = outcomeLista.reduce(reducer);

    let income = users[userId].transactions.findIndex(
      (user) => user.type == "income"
    );
    incomeLista.push(Number(users[userId].transactions[income].value));
    const incomeTotal: number = incomeLista.reduce(reducer);

    const total: number = Number(incomeTotal) - Number(outcomeTotal);

    const balance = {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: total,
    };
    res.status(200).send(JSON.stringify(balance));
  } else {
    res.status(400).send("Não foi possível encontrar as transações");
  }
});

app.put("/users/:userId/transactions/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const title = String(req.body.title);
  const value = Number(req.body.value);
  const type = String(req.body.type);
  const idTransactions = Number(req.params.id);
  const usersId = users.findIndex((user) => user.id == userId);

  if (usersId > -1) {
    if (title == "undefined" || isNaN(value) || type == "undefined") {
      res.send("Preencha todos os campos!");
    } else {
      users[usersId].transactions[idTransactions].title = title;
      users[usersId].transactions[idTransactions].value = value;
      users[usersId].transactions[idTransactions].type = type;
      res.send("Dados atualizados!");
    }
  } else {
    res.status(400).send("Não foi possível encontrar as transações");
  }
});

app.delete("/users/:userId/transactions/:id", (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const idTransactions = Number(req.params.id);
  const usersId = users.findIndex((user) => user.id == userId);
  if (userId != -1) {
    users[usersId].transactions.splice(idTransactions, 1);
    res.status(200).send("transação removida com sucesso!");
  } else {
    res.status(400).send("Falha na remoção do usuário");
  }
});
