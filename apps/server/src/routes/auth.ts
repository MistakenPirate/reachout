import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router, type RequestHandler } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";

const router: Router = Router();

const register: RequestHandler = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400).json({ error: "name, email, password, and phone are required" });
    return;
  }

  const validRoles = ["victim", "volunteer", "admin"];
  if (role && !validRoles.includes(role)) {
    res.status(400).json({ error: "role must be victim, volunteer, or admin" });
    return;
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "victim",
    })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET ?? "", {
    expiresIn: "7d",
  });

  res.status(201).json({ user, token });
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET ?? "", {
    expiresIn: "7d",
  });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

const me: RequestHandler = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, req.user.userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
};

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
