import { NextResponse } from "next/server";
import { getExportBundle } from "@/data/finance-repository";

export async function GET() {
  const bundle = await getExportBundle();

  return NextResponse.json(bundle, {
    headers: {
      "Content-Disposition": `attachment; filename="finance-map-export.json"`,
    },
  });
}
