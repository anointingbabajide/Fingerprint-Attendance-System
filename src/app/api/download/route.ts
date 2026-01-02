import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://clodhopping-telaesthetic-carlie.ngrok-free.dev";
const headers = { "ngrok-skip-browser-warning": "69420" };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attendance = searchParams.get("attendance");
  const students = searchParams.get("students");
  const temperature = searchParams.get("temperature");

  if (!attendance && !students && !temperature) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    if (attendance) {
      const response = await axios.get(`${BASE_URL}/download/attendance`, {
        headers,
        responseType: "blob",
      });
      return new NextResponse(response.data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="attendance.json"',
        },
      });
    } else if (students) {
      const response = await axios.get(`${BASE_URL}/download/students`, {
        headers,
        responseType: "blob",
      });
      return new NextResponse(response.data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="students.json"',
        },
      });
    } else if (temperature) {
      const response = await axios.get(`${BASE_URL}/download/temperature`, {
        headers,
        responseType: "blob",
      });
      return new NextResponse(response.data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="temperature.json"',
        },
      });
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
