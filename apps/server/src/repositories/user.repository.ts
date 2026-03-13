import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email));
}

export function findUserById(id: string) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id));
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "victim" | "volunteer" | "admin";
}) {
  return db
    .insert(users)
    .values(data)
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
}
