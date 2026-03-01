import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const { connections, password } = await request.json();

    // Validate admin password
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin password" },
        { status: 401 }
      );
    }

    // Validate connections data
    if (!Array.isArray(connections)) {
      return NextResponse.json(
        { error: "Invalid connections data: must be an array" },
        { status: 400 }
      );
    }

    // Write to connections.json
    const filePath = join(process.cwd(), "src", "data", "connections.json");
    const jsonContent = JSON.stringify(connections, null, 2);
    
    writeFileSync(filePath, jsonContent, "utf-8");

    return NextResponse.json({ 
      success: true, 
      message: "Connections saved successfully",
      connectionsCount: connections.length 
    });

  } catch (error) {
    console.error("Error saving connections:", error);
    return NextResponse.json(
      { error: "Failed to save connections" },
      { status: 500 }
    );
  }
}
