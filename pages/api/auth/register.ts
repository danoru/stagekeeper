import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

import prisma from "../../../src/data/db";
import { clientIp, rateLimit } from "../../../src/utils/rateLimit";
import {
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "../../../src/utils/validation";

const schema = yup.object().shape({
  email: yup.string().trim().email("Enter a valid email").required("Email is required."),
  username: yup
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`)
    .max(USERNAME_MAX_LENGTH, `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`)
    .matches(USERNAME_PATTERN, "Username can only contain letters, numbers, . _ and -.")
    .required("Username is required."),
  password: yup
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`)
    .required("Password is required."),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ip = clientIp(req);
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return res
      .status(429)
      .json({ error: "Too many accounts created from this address. Try later." });
  }

  try {
    const { email, username, password } = await schema.validate(req.body, { stripUnknown: true });

    const hashedPassword = await hash(password, 10);

    await prisma.users.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "Success." });
  } catch (e: any) {
    if (e instanceof yup.ValidationError) {
      return res.status(400).json({ error: e.errors.join(", ") });
    }
    // Unique violation on username/email (citext, so case-insensitive). Letting the DB
    // decide avoids the check-then-insert race.
    if (e?.code === "P2002") {
      const target: string[] = e.meta?.target ?? [];
      const field = target.includes("email") ? "Email" : "Username";
      return res.status(409).json({ error: `${field} is already taken.` });
    }
    console.error("Registration failed:", e);
    return res.status(500).json({ error: "Internal server error." });
  }
}

export default handler;
