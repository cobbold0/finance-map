import { NextResponse } from "next/server";
import { getCurrentUserProfile, getExportBundle } from "@/data/finance-repository";

export async function GET() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const bundle = await getExportBundle();

  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `attachment; filename="finance-map-export.json"`,
    },
  });
}
