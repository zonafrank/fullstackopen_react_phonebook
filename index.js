const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

let persons = require("./persons.json");

const getNextId = () => {
  let currentIds = persons.map((p) => p.id);
  let id;
  do {
    id = Math.floor(Math.random() * 1000000);
  } while (currentIds.includes(id));

  return id;
};

const app = express();
app.use(express.static("build"));
app.use(cors());
app.use(express.json());

morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["body"](req, res)
    ].join(" ");
  })
);

app.get("/info", (request, response) => {
  const appInfo = `
  <p>Phonebook has infor for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `;

  response.send(appInfo);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.post("/api/persons", (request, response) => {
  const { name, number } = request.body;
  if (!name || !number) {
    return response.status(400).json({ error: "name and number are required" });
  }

  const isNameIndDb = persons.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (isNameIndDb) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: getNextId(),
    name,
    number
  };

  persons.push(newPerson);
  response.json(newPerson);
});

app.get("/api/persons/:id", (request, response) => {
  const person = persons.find((p) => p.id === Number(request.params.id));

  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  persons = persons.filter((p) => p.id !== Number(request.params.id));
  response.status(204).end();
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
