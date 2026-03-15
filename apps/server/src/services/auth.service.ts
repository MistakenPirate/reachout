import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RegisterInput, LoginInput } from "@repo/shared/schemas";
import * as userRepo from "../repositories/user.repository.js";

export interface AuthResult {
	user: { id: string; name: string; email: string; role: string };
	token: string;
}

function signToken(userId: string, role: string): string {
	return jwt.sign({ userId, role }, process.env.JWT_SECRET ?? "", {
		expiresIn: "7d",
	});
}

export async function register(input: RegisterInput): Promise<AuthResult> {
	const [existing] = await userRepo.findUserByEmail(input.email);
	if (existing) {
		throw new ServiceError(409, "Email already registered");
	}

	const hashedPassword = await bcrypt.hash(input.password, 10);

	const [user] = await userRepo.createUser({
		name: input.name,
		email: input.email,
		password: hashedPassword,
		phone: input.phone,
		role: input.role,
	});

	if (!user) {
		throw new ServiceError(500, "Failed to create user");
	}

	return { user, token: signToken(user.id, user.role) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
	const [user] = await userRepo.findUserByEmail(input.email);
	if (!user) {
		throw new ServiceError(401, "Invalid email or password");
	}

	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) {
		throw new ServiceError(401, "Invalid email or password");
	}

	return {
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
		token: signToken(user.id, user.role),
	};
}

export async function getProfile(userId: string) {
	const [user] = await userRepo.findUserById(userId);
	if (!user) {
		throw new ServiceError(404, "User not found");
	}
	return user;
}

export class ServiceError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}
