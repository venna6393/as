const express = require("express");
const { format } = require("date-fns");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
let db = null;
app.use(express.json());
const install = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log("error obtained");
    process.exit(1);
  }
};
install();

app.get("/todos/", async (request, response) => {
  const { priority, status, category, search_q } = request.query;
  let query;
  if (priority !== undefined && status !== undefined) {
    query = `SELECT * FROM todo where priority = '${priority}' and status='${status}'`;
    let array = await db.all(query);
    response.send(array);
  } else if (category !== undefined && status !== undefined) {
    query = `SELECT * FROM todo where category = '${category}' and status='${status}'`;
    let array = await db.all(query);
    response.send(array);
  } else if (category !== undefined && priority !== undefined) {
    query = `SELECT * FROM todo where category = '${category}' and priority='${priority}'`;
    let array = await db.all(query);
    response.send(array);
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      query = `SELECT * FROM todo where priority = '${priority}'`;
      let array = await db.all(query);
      response.send(array);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      query = `SELECT * FROM todo where status='${status}'`;
      let array = await db.all(query);
      response.send(array);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      query = `SELECT * FROM todo where category = '${category}'`;
      let array = await db.all(query);
      response.send(array);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (search_q !== undefined) {
    query = `SELECT * FROM todo WHERE todo like '%${search_q}%'`;
    let array = await db.all(query);
    response.send(array);
  }
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = ${todoId}`;
  let array = await db.get(query);
  response.send(array);
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let newDew = new Date(date);
  if (newDew == "Invalid Date") {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const query = `SELECT * FROM todo WHERE due_date = '${date}'`;
    let array = await db.get(query);
    response.send(array);
  }
});
app.post("/todos/", async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  let newDew = new Date(dueDate);
  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (newDew == "Invalid Date") {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const query = `INSERT INTO todo (id,todo,category,priority,status,due_date)
    VALUES ('${id}','${todo}','${category}','${priority}','${status}','${dueDate}')`;
    await db.run(query);
    response.send("Todo Successfully Added");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { id, todo, category, priority, status, dueDate } = request.body;
  if (todo !== undefined) {
    const query = `UPDATE todo SET todo='${todo}' where id='${todoId}'`;
    await db.run(query);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const query = `UPDATE todo SET category='${category}' where id='${todoId}'`;
      await db.run(query);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (priority !== undefined) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const query = `UPDATE todo SET priority='${priority}' where id='${todoId}'`;
      await db.run(query);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status !== undefined) {
    if (status === "TODO" || status === "IN PROGRESS" || status === "DONE") {
      const query = `UPDATE todo SET status='${status}' where id='${todoId}'`;
      await db.run(query);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (dueDate !== undefined) {
    console.log(dueDate);
    let newDew = new Date(dueDate);
    console.log(newDew == "Invalid Date");
    if (newDew != "Invalid Date") {
      const query = `UPDATE todo SET todo='${dueDate}' where id='${todoId}'`;
      await db.run(query);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date ");
    }
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
