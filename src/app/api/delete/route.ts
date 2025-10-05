import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { fpid } = await request.json();

    if (!fpid) {
      return NextResponse.json({ error: "fpid is required" }, { status: 400 });
    }

    const { data } = await axios.post(
      `https://clodhopping-telaesthetic-carlie.ngrok-free.dev/deleteemployee?fpid=${fpid}`,
      {},
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    console.log("Delete response:", data);

    return new NextResponse(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);

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
