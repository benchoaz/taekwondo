import { jwtVerify, SignJWT } from "jose";

interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret || secret.length === 0) {
    // Gunakan fallback untuk dev environment agar tidak crash jika lupa set env
    return "tkd-academy-super-secret-key-2026-very-long";
  }
  return secret;
};

export const signJWT = async (
  payload: SessionPayload,
  options: { exp: string }
) => {
  try {
    const secret = new TextEncoder().encode(getJwtSecretKey());
    const alg = "HS256";
    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setExpirationTime(options.exp)
      .setIssuedAt()
      .setSubject(payload.userId)
      .sign(secret);
  } catch (error) {
    throw error;
  }
};

export const verifyJWT = async <T>(token: string): Promise<T> => {
  try {
    const secret = new TextEncoder().encode(getJwtSecretKey());
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch (error) {
    throw new Error("Your token has expired or is invalid.");
  }
};
