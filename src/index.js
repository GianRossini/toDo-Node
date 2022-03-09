const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) response.status(404).json({ error: "User doesn't exist." });

  request.user = user;

  return next();
}

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.some(user => user.username === username)) {
    return response.status(400).json({ error: "User already exists." });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.json(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title } = request.body;

  const toDoIndex = user.todos.findIndex(toDo => toDo.id === id);

  if (toDoIndex === -1) response.status(404).json({ error: "To Do does not exist." });

  user.todos[toDoIndex].title = title;

  return response.status(200).json(user.todos[toDoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const toDoIndex = user.todos.findIndex(toDo => toDo.id === id);

  if (toDoIndex === -1) response.status(404).json({ error: "To Do does not exist." });

  user.todos[toDoIndex].done = true;

  return response.status(200).json(user.todos[toDoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const toDo = user.todos.find(toDo => toDo.id === id);

  if (!toDo) response.status(404).json({ error: "To Do does not exist." });

  user.todos.splice(toDo, 1);

  return response.status(204).send();
});

module.exports = app;