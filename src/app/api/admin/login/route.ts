import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, ADMIN_COOKIE_NAME, ADMIN_TOKEN_VALUE } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, username, email, password } = body;
    const loginId = (identifier || username || email || "").toString().trim().toLowerCase();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe est obligatoire." },
        { status: 400 }
      );
    }

    let isValid = false;

    // 1. Direct password verification (fouad97)
    if (verifyAdminPassword(password)) {
      isValid = true;
    }

    // 2. Database User verification (admin@fouadstore.dz / username admin)
    if (!isValid && loginId) {
      try {
        await connectToDatabase();
        const user = await UserModel.findOne({
          $or: [{ email: loginId }, { username: loginId }],
          isActive: true,
        });

        if (user && user.password === password.trim()) {
          isValid = true;
        }
      } catch (dbErr) {
        console.warn("Database user verification fallback:", dbErr);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Authentification réussie.",
    });

    // Set HTTP-only secure cookie for 30 days
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: ADMIN_TOKEN_VALUE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
