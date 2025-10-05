"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    pendingSync: 0,
  });

  const [formData, setFormData] = useState({
    fpid: 1,
    matricNo: "",
    fullName: "",
    email: "",
    position: "",
  });

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    loadStudents();
    loadAttendance();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [students, attendance]);

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/liststudents");
      const data = await response.json();
      const studentsArray: any = Object.values(data);
      setStudents(studentsArray);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await fetch("api//viewattendance");
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendance([]);
    }
  };

  const calculateStats = () => {
    const today = new Date()
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "");

    const todayRecords = attendance.filter((r: any) => r.date === today);
    const signedIn = new Set(
      todayRecords
        .filter((r: any) => r.sign_type === "Sign In")
        .map((r: any) => r.fpid)
    );

    setStats({
      totalStudents: students.length,
      presentToday: signedIn.size,
      absentToday: Math.max(0, students.length - signedIn.size),
      pendingSync: attendance.filter((r: any) => !r.uploaded).length,
    });
  };

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (
      !formData.matricNo ||
      !formData.fullName ||
      !formData.email ||
      !formData.position
    ) {
      alert("Please fill in all fields.");
      return;
    }
    alert("Enrolling student... Please scan your fingerprint.");
    const formBody = new URLSearchParams();
    formBody.append("mfpid", String(formData.fpid));
    formBody.append("mstudent_id", formData.matricNo);
    formBody.append("mname", formData.fullName);
    formBody.append("memail_id", formData.email);
    formBody.append("mpos", formData.position);

    try {
      const response = await fetch("/api/insert", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formBody.toString(),
      });

      const result = await response.text();

      if (result === "OK") {
        alert("Student enrolled successfully!");
        loadStudents();
        setFormData({
          fpid: formData.fpid + 1,
          matricNo: "",
          fullName: "",
          email: "",
          position: "",
        });
        setIsModalOpen(false);
      } else {
        alert("Enrollment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Error: " + error);
    }
  };

  const handleDeleteStudent = async (fpid: any) => {
    if (!fpid) {
      alert("Invalid student ID");
      return;
    }

    if (confirm("Delete this student?")) {
      try {
        const response = await fetch("/api/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fpid }),
        });

        if (response.ok) {
          loadStudents();
          alert("Student deleted successfully");
        } else {
          const error = await response.json();
          alert("Delete failed: " + error.error);
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Error: " + error);
      }
    }
  };

  const statsCards = [
    {
      id: "total",
      label: "Total Students",
      value: stats.totalStudents,
      color: "text-blue-600",
    },
    {
      id: "present",
      label: "Present Today",
      value: stats.presentToday,
      color: "text-green-600",
    },
    {
      id: "absent",
      label: "Absent Today",
      value: stats.absentToday,
      color: "text-red-600",
    },
    {
      id: "pending",
      label: "Pending Sync",
      value: stats.pendingSync,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="container w-full relative bg-[#f5f7fa] mx-auto text-black flex flex-col min-h-screen py-5 px-5">
      {/* Header */}
      <div className="bg-white w-full h-20 p-5 flex flex-row justify-between items-center rounded-lg shadow mb-5">
        <h1 className="text-[#2563eb] font-bold text-xl">
          Fingerprint Attendance System
        </h1>
        <div className="flex flex-row items-center gap-3">
          <button
            onClick={() => {
              loadStudents();
              loadAttendance();
            }}
            className="bg-white text-gray-700 border border-gray-300 px-4 h-10 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={handleModal}
            className="bg-[#2563eb] text-white w-48 h-10 rounded-lg hover:bg-[#1d4ed8]"
          >
            Add Student
          </button>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {statsCards.map((stat) => (
          <div key={stat.id} className="bg-white p-5 rounded-lg shadow">
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Enrolled Students - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Enrolled Students
            </h2>
          </div>
          <div className="p-5">
            {students.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No students enrolled
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Matric No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students?.map((student: any) => (
                      <tr
                        key={student.fpid}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                            {student.fpid}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.matricNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.position}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteStudent(student.fpid)}
                            className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Attendance - Takes 1 column */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Attendance</h2>
          </div>
          <div className="p-5">
            {attendance.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No attendance records
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {attendance
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map((record: any, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="font-medium text-sm text-gray-800 mb-1">
                        {record.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {record.date} at {record.time}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            record.sign_type === "Sign In"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.sign_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {record.uploaded ? "✓ Synced" : "⏳ Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleModal={handleModal}
        />
      )}
    </div>
  );
}

// Define Modal component outside the parent component
function Modal({
  formData,
  handleInputChange,
  handleSubmit,
  handleModal,
}: {
  formData: any;
  handleInputChange: (e: any) => void;
  handleSubmit: (e: any) => void;
  handleModal: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-96 rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Enroll Student
          </h2>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fingerprint ID
              </label>
              <input
                type="number"
                name="fpid"
                value={formData.fpid}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID / Matric Number
              </label>
              <input
                type="text"
                name="matricNo"
                value={formData.matricNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="STU001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class / Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CS Year 3"
                required
              />
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}
