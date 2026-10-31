import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, ADMIN_COOKIE_NAME, ADMIN_TOKEN_VALUE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect." },
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
