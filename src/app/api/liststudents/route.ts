import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://clodhopping-telaesthetic-carlie.ngrok-free.dev/viewstudents",
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    console.log("Fetched data:", data);

    // Convert object to array
    const studentsArray = Object.values(data);
    console.log("Converted to array:", studentsArray);

    return NextResponse.json(studentsArray);
  } catch (error) {
    console.error("Error fetching students:", error);

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
