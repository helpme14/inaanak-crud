"use client";

import { useNavigate } from "react-router-dom";
import { Gift, Heart, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-8 md:px-12">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-red-600" />
          <span className="text-xl font-bold text-gray-900">INAANAK</span>
        </div>
        <div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Admin Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-20">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Festive Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-300 via-amber-200 to-green-300 blur-3xl opacity-30 animate-pulse" />
              <div className="relative p-6 bg-white rounded-full shadow-lg">
                <Heart className="w-16 h-16 mx-auto text-red-600" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl text-balance">
              <span className="text-red-600">Share</span> the Joy of{" "}
              <span className="text-green-700">Giving</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg leading-relaxed text-gray-600">
              Register your Inaanak and make this holiday season special. A
              beautiful tradition of generosity and connection.
            </p>
          </div>

          {/* How it Works */}
          <div className="grid gap-6 my-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Enter guardian and child information",
              },
              {
                step: "02",
                title: "Verify",
                desc: "Confirm your email address",
              },
              {
                step: "03",
                title: "Connect",
                desc: "Wait for Ninong's approval",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md"
              >
                <div className="mb-2 text-3xl font-bold text-red-600">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
            <button
              onClick={() => navigate("/register/guardian-info")}
              className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-full shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
            >
              <Gift className="w-5 h-5" />
              Register Inaanak
            </button>
            <button
              onClick={() => navigate("/check-status")}
              className="px-8 py-3 font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-full hover:bg-gray-50"
            >
              Check Status
            </button>
          </div>

          {/* Festive Footer Message */}
          <p className="flex items-center justify-center gap-2 pt-8 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Making holidays brighter, one gift at a time
            <Sparkles className="w-4 h-4 text-amber-500" />
          </p>
        </div>
      </main>
    </div>
  );
}
