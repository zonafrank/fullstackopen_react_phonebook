require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/person");
const middleware = require("./middleware");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("*** Database connection established ***");
  })
  .catch((err) => {
    console.log("*** Error connecting to database ***");
    console.log(err);
  });

process.on("exit", () => {
  console.log("*** EXIT - close database connection ***");
  mongoose.connection.close();
});

//Cleanups
//catching signals and doing cleanup
[
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM"
].forEach(function (signal) {
  process.on(signal, function () {
    mongoose.connection.close();
    process.exit(1);
  });
});

let persons = require("./persons.json");

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
  Person.find({}).then((persons) => {
    const appInfo = `
  <p>Phonebook has infor for ${persons.length} people</p>
  <p>${new Date().toString()}</p>
  `;

    response.send(appInfo);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((dbResponse) => {
    response.json(dbResponse);
  });
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body;
  if (!name || !number) {
    return response.status(400).json({ error: "name and number are required" });
  }

  // const isNameIndDb = persons.some(
  //   (p) => p.name.toLowerCase() === name.toLowerCase()
  // );
  // if (isNameIndDb) {
  //   return response.status(400).json({ error: "name must be unique" });
  // }

  const newPerson = new Person({ name, number });

  newPerson
    .save()
    .then((dbResponse) => {
      response.json(dbResponse);
    })
    .catch((err) => {
      next(err);
    });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((dbResponse) => {
      if (dbResponse) {
        response.json(dbResponse);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });

  // if (!person) {
  //   return response.status(404).end();
  // }
});

app.put("/api/persons/:id", (request, response, next) => {
  const updateObj = {
    name: request.body.name,
    number: request.body.number
  };

  Person.findByIdAndUpdate(request.params.id, updateObj, {
    new: true,
    runValidators: true,
    context: "query"
  })
    .then((dbResponse) => {
      response.json(dbResponse);
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
