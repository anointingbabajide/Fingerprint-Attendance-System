import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://clodhopping-telaesthetic-carlie.ngrok-free.dev/attendance",
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    console.log("Fetched data:", data);

    // Convert object to array if needed (like the students endpoint)
    const attendanceArray = Object.values(data);
    console.log("Converted to array:", attendanceArray);

    const response = NextResponse.json(attendanceArray);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error) {
    console.error("Error fetching attendance:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
