import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb://localhost:27017/turnero-app";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "operador", "cliente"],
      default: "cliente",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const users = [
  { name: "Admin", email: "admin@gmail.com", password: "test123", role: "admin" as const },
  { name: "Operador", email: "operador@gmail.com", password: "test123", role: "operador" as const },
  { name: "Cliente", email: "cliente@gmail.com", password: "test123", role: "cliente" as const },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Conectado a MongoDB");

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`Ya existe: ${u.email} (${u.role}) - saltando`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashedPassword });
    console.log(`Creado: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log("Seed completado");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
