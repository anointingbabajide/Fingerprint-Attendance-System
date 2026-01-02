"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TemperatureRecord {
  date: string;
  time: string;
  temperature: number;
}

interface ApiResponse {
  data: TemperatureRecord[];
  roomtemp: {
    data: number;
  };
}

export default function TemperatureMonitor() {
  const [currentTemp, setCurrentTemp] = useState<any>(24.5);
  const [humidity, setHumidity] = useState(65);
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);
  const [avg, setAvg] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("Just now");
  const [chartData, setChartData] = useState<
    Array<{ time: string; temp: number; humidity: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTemperatureDescription = (temp: number) => {
    if (temp < 18) return "Cool";
    if (temp < 23) return "Comfortable";
    if (temp < 28) return "Warm";
    return "Hot";
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30) return { text: "Too Dry", color: "text-orange-400" };
    if (humidity < 60) return { text: "Optimal", color: "text-green-400" };
    if (humidity < 70) return { text: "Normal", color: "text-blue-400" };
    return { text: "High", color: "text-red-400" };
  };

  const calculateStats = (records: TemperatureRecord[]) => {
    if (records.length === 0) return;

    const temps = records.map((r) => r.temperature);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    setHigh(parseFloat(maxTemp.toFixed(2)));
    setLow(parseFloat(minTemp.toFixed(2)));
    setAvg(parseFloat(avgTemp.toFixed(2)));
  };

  const fetchTemperatureData = async () => {
    try {
      const response = await fetch("/api/gettemperature");

      if (!response.ok) {
        throw new Error("Failed to fetch temperature data");
      }

      const result: ApiResponse = await response.json();

      // Update current temperature
      if (result?.roomtemp) {
        setCurrentTemp(result?.roomtemp);
      }
      console.log("Received temperature data:", result?.data);

      // Update chart data
      if (result?.data && Array.isArray(result?.data)) {
        const formattedData = result?.data.map((record) => ({
          time: record.time,
          temp: record.temperature,
          humidity: 65, // You can add humidity to your ESP32 if you have a sensor
        }));

        // Take last 12 records for chart
        const last12Records = formattedData.slice(-12);
        setChartData(last12Records);

        // Calculate stats
        calculateStats(result?.data);
      }

      // Update timestamp
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastUpdate(timeString);

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching temperature:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTemperatureData();

    // Update every 5 seconds
    const interval = setInterval(() => {
      fetchTemperatureData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full mt-8 mb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading temperature data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-8 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <button
            onClick={fetchTemperatureData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 mb-8">
      {/* Section Header */}
      <div className="bg-white rounded-lg shadow mb-5 p-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Classroom Monitoring System
        </h2>
        <p className="text-sm text-gray-600">
          Real-time classroom temperature tracking
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Temperature Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium uppercase tracking-wide opacity-90">
                Temperature
              </div>
              <svg
                className="w-8 h-8 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="mb-3">
              <span className="text-6xl font-bold">{currentTemp}</span>
              <span className="text-3xl font-light ml-1">°C</span>
            </div>
            <div className="text-sm opacity-90">
              {getTemperatureDescription(currentTemp)}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">High</div>
            <div className="text-2xl font-bold text-red-500">{high}°C</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Average</div>
            <div className="text-2xl font-bold text-blue-500">{avg}°C</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Low</div>
            <div className="text-2xl font-bold text-green-500">{low}°C</div>
          </div>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Temperature Trend
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Last {chartData.length} Readings
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
              domain={[15, 35]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "#374151", fontWeight: "600" }}
              formatter={(value: number | undefined) => [
                `${value?.toFixed(1) ?? "N/A"}°C`,
                "Temperature",
              ]}
              cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            />
            <Bar dataKey="temp" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-lg shadow p-4 mt-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Live Monitoring</span>
            <span className="text-gray-400">•</span>
            <span>ESP32 Sensor</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: <span className="font-medium">{lastUpdate}</span>
          </div>
          <div className="text-xs text-gray-400">Updates every 5 seconds</div>
        </div>
      </div>
    </div>
  );
}
