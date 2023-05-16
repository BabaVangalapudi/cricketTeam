const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const playerQuery = `SELECT * FROM player ORDER BY player_id`;
  const playerList = await db.all(playerQuery);
  response.send(
    playerList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
//API 2
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlayerQuery = `INSERT INTO player(playerName, jerseyNumber, role) VALUES ${playerName}, ${jerseyNumber}, ${role};`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
//API 3
app.get("/players/:playerId", async (request, response) => {
  const playerId = request.params;
  const playerQuery = `SELECT * FROM player WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});
//API 4
app.put("/players/:playerId", async (request, response) => {
  const playerId = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `UPDATE player SET playerName = ${playerName}, jerseyNumber = ${jerseyNumber}, role = ${role} WHERE player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});
//API 5
app.delete("/player/:playerId", async (request, response) => {
  const playerId = request.params;
  const deleteQuery = `DELETE FROM player WHERE player_id = ${playerId}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
