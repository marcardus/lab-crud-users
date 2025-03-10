const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;

app.use(express.json());

// Simulación de base de datos en memoria
let users = [];

// Función para validar la edad
const isAdult = (birthDate) => {
  const birth = new Date(birthDate);
  const age = new Date().getFullYear() - birth.getFullYear();
  return age >= 18;
};

// Crear usuario (POST)
app.post("/users", async (req, res) => {
  const { nombre, email, bio, avatar, birthDate, password } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: "Los campos nombre y email son requeridos" });
  }
  if (!isAdult(birthDate)) {
    return res.status(400).json({ error: "Debes ser mayor de edad para registrarte" });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    nombre,
    email,
    bio,
    avatar,
    birthDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: hashedPassword,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Obtener listado de usuarios con filtro por edad (GET)
app.get("/users", (req, res) => {
  let filteredUsers = users;
  if (req.query.olderThan) {
    const minAge = parseInt(req.query.olderThan);
    filteredUsers = users.filter(user => {
      const age = new Date().getFullYear() - new Date(user.birthDate).getFullYear();
      return age > minAge;
    });
  }
  res.json(filteredUsers);
});

// Obtener usuario por ID (GET)
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(user);
});

// Actualizar usuario (PATCH)
app.patch("/users/:id", async (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const { nombre, email, bio, avatar, password } = req.body;
  if (nombre) user.nombre = nombre;
  if (email) user.email = email;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;
  if (password) user.password = await bcrypt.hash(password, 10);
  
  user.updatedAt = new Date();
  res.json(user);
});

// Eliminar usuario (DELETE)
app.delete("/users/:id", (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
