import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    // Get the URL-encoded body from the request
    const body = await request.text();

    console.log("Request body:", body);

    const { data } = await axios.post(
      "https://clodhopping-telaesthetic-carlie.ngrok-free.dev/insert",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    console.log("Insert response:", data);

    // Return the response as text to match your frontend expectation
    return new NextResponse(data, { status: 200 });
  } catch (error) {
    console.error("Error inserting student:", error);

    if (axios.isAxiosError(error)) {
      return new NextResponse(error.message, {
        status: error.response?.status || 500,
      });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
