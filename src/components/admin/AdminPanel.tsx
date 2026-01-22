import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryDashboard } from "./InventoryDashboard";
import { COAScanner } from "./COAScanner";
import { OperatorDemo } from "../OperatorDemo";
import { COLORS } from "../../lib/colors";
import logo from "figma:asset/f7eabe4467f2f507507acb041076599c4b9fae68.png";
import { IntelligenceDashboard } from "./IntelligenceDashboard";

type Props = {
  onExitAdmin: () => void;
  onEnterDemoMode: () => void;
};

type AdminView = "home" | "inventory" | "settings" | "intelligence";

export function AdminPanel({
  onExitAdmin,
  onEnterDemoMode,
}: Props) {
  const [currentView, setCurrentView] = useState<AdminView>("home");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showOperatorDemo, setShowOperatorDemo] = useState(false);

  const handleToggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    if (newMode) {
      onEnterDemoMode();
    }
  };

  // INTELLIGENCE VIEW
  if (currentView === "intelligence") {
    return (
      <div className="fixed inset-0 flex flex-col bg-black overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between bg-[#111]">
          <button onClick={() => setCurrentView("home")} className="text-white/50 hover:text-white text-xs uppercase tracking-widest flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
            Back
          </button>
          <span className="text-white font-serif">Merchant Intelligence</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          <IntelligenceDashboard />
        </div>
      </div>
    );
  }

  // MOBILE-FIRST: Admin Home (Primary View)
  if (currentView === "home") {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{ backgroundColor: COLORS.background }}
      >
        {/* Header - Admin Mode Indicator */}
        <div
          className="flex-shrink-0 px-6 pt-6 pb-4 border-b"
          style={{ borderColor: COLORS.neutral.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="h-10 opacity-80"
              />
              <div>
                <div
                  className="text-lg font-medium"
                  style={{ color: COLORS.foreground }}
                >
                  Admin Panel
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: COLORS.neutral.text.tertiary,
                  }}
                >
                  StrainMath™ Operator System
                </div>
              </div>
            </div>
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl border text-sm"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
                color: COLORS.neutral.text.secondary,
              }}
            >
              Exit
            </button>
          </div>

          {/* Demo Mode Banner */}
          {demoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 rounded-xl border flex items-center gap-2"
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                borderColor: COLORS.stack.primary,
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: COLORS.stack.primary,
                  boxShadow: `0 0 8px ${COLORS.stack.primary}`,
                }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: COLORS.stack.primary }}
              >
                Demo Mode Active • Using Sample Data
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Content - Single Column, Card-Based */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4 max-w-2xl mx-auto">

            {/* NEW INTELLIGENCE CARD */}
            <motion.button
              onClick={() => setCurrentView("intelligence")}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl p-6 border text-left bg-gradient-to-br from-[#00FFD1]/10 to-transparent border-[#00FFD1]/30"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#00FFD1]/20 text-[#00FFD1]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                </div>
                <div>
                  <div className="text-lg font-medium text-white">Merchant Intelligence</div>
                  <div className="text-sm text-[#00FFD1]/70">Live analytics & events</div>
                </div>
              </div>
            </motion.button>

            {/* Primary Action: Scan COA */}
            <motion.button
              onClick={() => setScannerOpen(true)}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl p-6 border text-left relative overflow-hidden"
              style={{
                background: COLORS.blend.gradient,
                borderColor: COLORS.blend.primary,
                boxShadow: `0 0 30px ${COLORS.blend.primary}40`,
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="2"
                          stroke={COLORS.foreground}
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12H16M12 8V16"
                          stroke={COLORS.foreground}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-lg font-medium"
                        style={{ color: COLORS.foreground }}
                      >
                        Scan COA
                      </div>
                      <div
                        className="text-sm"
                        style={{
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        Add product to inventory
                      </div>
                    </div>
                  </div>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke={COLORS.foreground}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* Inventory Status Card */}
            <motion.button
              onClick={() => setCurrentView("inventory")}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl p-6 border text-left"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor:
                        "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="7"
                        height="7"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                      />
                      <rect
                        x="13"
                        y="4"
                        width="7"
                        height="7"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                      />
                      <rect
                        x="4"
                        y="13"
                        width="7"
                        height="7"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="7"
                        height="7"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-lg font-medium"
                      style={{ color: COLORS.foreground }}
                    >
                      Inventory
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: COLORS.neutral.text.secondary,
                      }}
                    >
                      Manage products
                    </div>
                  </div>
                </div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke={COLORS.neutral.text.secondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.button>

            {/* Demo Mode Toggle Card */}
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(168, 85, 247, 0.1)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                        stroke={COLORS.stack.primary}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: COLORS.foreground }}
                    >
                      Demo Mode
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: COLORS.neutral.text.secondary,
                      }}
                    >
                      Use sample inventory
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleDemoMode}
                  className={`w-12 h-7 rounded-full transition-colors relative ${demoMode
                    ? "bg-purple-600"
                    : "bg-white/10"
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${demoMode ? "translate-x-5" : ""
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Operator Demo Card */}
            <motion.button
              onClick={() => setShowOperatorDemo(true)}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl p-6 border text-left"
              style={{
                backgroundColor: `${COLORS.stack.primary}08`,
                borderColor: `${COLORS.stack.primary}40`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${COLORS.stack.primary}15`,
                      border: `1px solid ${COLORS.stack.primary}40`,
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        stroke={COLORS.stack.primary}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-lg font-medium"
                      style={{ color: COLORS.stack.primary }}
                    >
                      Operator Demo
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: COLORS.neutral.text.secondary,
                      }}
                    >
                      Auto-playing demo for operators
                    </div>
                  </div>
                </div>
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke={COLORS.stack.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </div>
            </motion.button>
          </div>
        </div>

        {/* COA Scanner Modal */}
        {scannerOpen && (
          <COAScanner
            onClose={() => setScannerOpen(false)}
            onComplete={(data) => {
              console.log("COA data:", data);
              setScannerOpen(false);
            }}
          />
        )}

        {/* Operator Demo - Auto-playing presentation */}
        {showOperatorDemo && (
          <OperatorDemo
            onClose={() => setShowOperatorDemo(false)}
          />
        )}
      </div>
    );
  }

  // MOBILE-FIRST: Inventory View
  if (currentView === "inventory") {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{ backgroundColor: COLORS.background }}
      >
        {/* Mobile Header with Back Button */}
        <div
          className="flex-shrink-0 px-6 pt-6 pb-4 border-b flex items-center justify-between"
          style={{ borderColor: COLORS.neutral.border }}
        >
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border"
            style={{
              backgroundColor: COLORS.neutral.surface,
              borderColor: COLORS.neutral.border,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke={COLORS.foreground}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-sm"
              style={{ color: COLORS.neutral.text.primary }}
            >
              Back
            </span>
          </button>
          <img
            src={logo}
            alt="Logo"
            className="h-8 opacity-50"
          />
        </div>

        {/* Inventory Dashboard - Responsive */}
        <InventoryDashboard
          onAddInventory={() => setScannerOpen(true)}
        />

        {/* COA Scanner Modal */}
        {scannerOpen && (
          <COAScanner
            onClose={() => setScannerOpen(false)}
            onComplete={(data) => {
              console.log("COA data:", data);
              setScannerOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  // MOBILE-FIRST: Settings View
  if (currentView === "settings") {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{ backgroundColor: COLORS.background }}
      >
        {/* Mobile Header with Back Button */}
        <div
          className="flex-shrink-0 px-6 pt-6 pb-4 border-b flex items-center justify-between"
          style={{ borderColor: COLORS.neutral.border }}
        >
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border"
            style={{
              backgroundColor: COLORS.neutral.surface,
              borderColor: COLORS.neutral.border,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke={COLORS.foreground}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-sm"
              style={{ color: COLORS.neutral.text.primary }}
            >
              Back
            </span>
          </button>
          <img
            src={logo}
            alt="Logo"
            className="h-8 opacity-50"
          />
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <h1
              className="text-3xl font-light mb-2"
              style={{ color: COLORS.foreground }}
            >
              Settings
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: COLORS.neutral.text.secondary }}
            >
              System configuration
            </p>

            <div className="space-y-4">
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: COLORS.neutral.surface,
                  borderColor: COLORS.neutral.border,
                }}
              >
                <h3
                  className="font-medium mb-2"
                  style={{ color: COLORS.foreground }}
                >
                  System Preferences
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: COLORS.neutral.text.secondary,
                  }}
                >
                  Configure blending algorithms, default
                  settings, and system behavior
                </p>
              </div>

              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: COLORS.neutral.surface,
                  borderColor: COLORS.neutral.border,
                }}
              >
                <h3
                  className="font-medium mb-2"
                  style={{ color: COLORS.foreground }}
                >
                  Integrations
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: COLORS.neutral.text.secondary,
                  }}
                >
                  Connect to POS systems, compliance platforms,
                  and third-party tools
                </p>
              </div>

              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: COLORS.neutral.surface,
                  borderColor: COLORS.neutral.border,
                }}
              >
                <h3
                  className="font-medium mb-2"
                  style={{ color: COLORS.foreground }}
                >
                  User Management
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: COLORS.neutral.text.secondary,
                  }}
                >
                  Manage staff access, permissions, and operator
                  accounts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}