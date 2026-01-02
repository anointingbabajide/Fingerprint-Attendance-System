import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = "https://clodhopping-telaesthetic-carlie.ngrok-free.dev";
const headers = { "ngrok-skip-browser-warning": "69420" };

export async function GET() {
  try {
    const [temperatureRecords, roomTemp] = await Promise.all([
      axios.get(`${BASE_URL}/gettemperaturerecords`, { headers }),
      axios.get(`${BASE_URL}/getroomtemperature`, { headers }),
    ]);

    console.log("Raw data type:", typeof temperatureRecords.data);
    console.log("Raw data length:", temperatureRecords.data?.length);

    let parsedData = temperatureRecords.data;

    // If it's a string, try to parse it
    if (typeof temperatureRecords.data === "string") {
      try {
        // Check if the string is complete (ends with ])
        const trimmed = temperatureRecords.data.trim();
        console.log("String ends with:", trimmed.slice(-10));
        console.log("String starts with:", trimmed.slice(0, 10));

        // If the JSON is incomplete (doesn't end with ]), try to fix it
        if (!trimmed.endsWith("]")) {
          console.log("JSON is incomplete, attempting to fix...");
          // Find the last complete object
          const lastCompleteIndex = trimmed.lastIndexOf("}");
          if (lastCompleteIndex > 0) {
            const fixedJson = trimmed.substring(0, lastCompleteIndex + 1) + "]";
            console.log("Fixed JSON ends with:", fixedJson.slice(-20));
            parsedData = JSON.parse(fixedJson);
          }
        } else {
          parsedData = JSON.parse(trimmed);
        }

        console.log("Successfully parsed! Array length:", parsedData.length);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.log(
          "Problematic string (first 500 chars):",
          temperatureRecords.data.substring(0, 500)
        );
        console.log(
          "Problematic string (last 500 chars):",
          temperatureRecords.data.slice(-500)
        );

        // Return empty array if parsing fails
        parsedData = [];
      }
    }

    console.log("Final data is array?", Array.isArray(parsedData));
    console.log("Final data length:", parsedData?.length);

    const response = NextResponse.json({
      data: parsedData,
      roomtemp: roomTemp.data,
      timestamp: Date.now(),
    });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error) {
    console.error("Error fetching temp records:", error);

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
