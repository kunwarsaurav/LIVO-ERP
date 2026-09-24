import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
// import redis from "@/lib/redis";
import { UnauthorizedError } from "@/lib/errors";
import redis from "@/lib/redis";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  sessionId: string;
}

export const authenticateUser = async (
  request: NextRequest,
  allowedRole: string[],
): Promise<AuthenticatedUser> => {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) throw new UnauthorizedError("Please signin to continue");

  let decoded: AuthenticatedUser;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;
  } catch (error) {
    throw new UnauthorizedError("Invalid or Expired Access Token");
  }

  const storedToken = await redis.get(`access:${decoded.sessionId}`);
  if (!storedToken || storedToken !== token)
    throw new UnauthorizedError(
      "Your session has expired. Please log in again.",
    );
  if (allowedRole && !allowedRole.includes(decoded.role)) {
    throw new UnauthorizedError(
      "You are not authorized to perform this action",
    );
  }
  return decoded;
};
