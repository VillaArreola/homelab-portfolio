import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const { topology, password } = await request.json();

    // Validate admin password
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin password" },
        { status: 401 }
      );
    }

    // Validate topology data
    if (!Array.isArray(topology)) {
      return NextResponse.json(
        { error: "Invalid topology data: must be an array" },
        { status: 400 }
      );
    }

    // Write to infrastructure.json
    const filePath = join(process.cwd(), "src", "data", "infrastructure.json");
    const jsonContent = JSON.stringify(topology, null, 2);
    
    writeFileSync(filePath, jsonContent, "utf-8");

    return NextResponse.json({ 
      success: true, 
      message: "Topology saved successfully",
      nodesCount: topology.length 
    });

  } catch (error) {
    console.error("Error saving topology:", error);
    return NextResponse.json(
      { error: "Failed to save topology" },
      { status: 500 }
    );
  }
}
