import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InventoryDashboard } from "./InventoryDashboard";
import { COAScanner } from "./COAScanner";
import { OperatorDemo } from "../OperatorDemo";
import { COLORS } from "../../lib/colors";
import logo from "figma:asset/f7eabe4467f2f507507acb041076599c4b9fae68.png";

type Props = {
  onExitAdmin: () => void;
  onEnterDemoMode: () => void;
};

type AdminView = "home" | "inventory" | "settings";

export function AdminPanel({
  onExitAdmin,
  onEnterDemoMode,
}: Props) {
  const [currentView, setCurrentView] =
    useState<AdminView>("home");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showOperatorDemo, setShowOperatorDemo] =
    useState(false);

  const handleToggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    if (newMode) {
      onEnterDemoMode();
    }
  };

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
                  Guided Outcomes™ Operator System
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

              {/* Status Grid - Quick Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    backgroundColor: "rgba(0, 255, 163, 0.1)",
                    borderColor: "rgba(0, 255, 163, 0.3)",
                  }}
                >
                  <div
                    className="text-2xl font-light mb-1"
                    style={{ color: COLORS.blend.primary }}
                  >
                    12
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: COLORS.neutral.text.tertiary,
                    }}
                  >
                    Ready
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    backgroundColor: "rgba(255, 170, 0, 0.1)",
                    borderColor: "rgba(255, 170, 0, 0.3)",
                  }}
                >
                  <div
                    className="text-2xl font-light mb-1"
                    style={{ color: COLORS.warning }}
                  >
                    3
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: COLORS.neutral.text.tertiary,
                    }}
                  >
                    Needs COA
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    backgroundColor: COLORS.neutral.surface,
                    borderColor: COLORS.neutral.border,
                  }}
                >
                  <div
                    className="text-2xl font-light mb-1"
                    style={{
                      color: COLORS.neutral.text.secondary,
                    }}
                  >
                    2
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: COLORS.neutral.text.tertiary,
                    }}
                  >
                    Inactive
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Demo Mode Toggle Card */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: demoMode
                  ? "rgba(168, 85, 247, 0.1)"
                  : COLORS.neutral.surface,
                borderColor: demoMode
                  ? COLORS.stack.primary
                  : COLORS.neutral.border,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: demoMode
                        ? "rgba(168, 85, 247, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke={
                          demoMode
                            ? COLORS.stack.primary
                            : COLORS.foreground
                        }
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 1V3M12 21V23M23 12H21M3 12H1M20.49 20.49L19.07 19.07M4.93 4.93L3.51 3.51M20.49 3.51L19.07 4.93M4.93 19.07L3.51 20.49"
                        stroke={
                          demoMode
                            ? COLORS.stack.primary
                            : COLORS.foreground
                        }
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-lg font-medium"
                      style={{
                        color: demoMode
                          ? COLORS.stack.primary
                          : COLORS.foreground,
                      }}
                    >
                      Demo Mode
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: COLORS.neutral.text.secondary,
                      }}
                    >
                      {demoMode
                        ? "Using sample data"
                        : "For training & walkthroughs"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleDemoMode}
                  className="relative w-14 h-8 rounded-full transition-colors"
                  style={{
                    backgroundColor: demoMode
                      ? COLORS.stack.primary
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <motion.div
                    animate={{ x: demoMode ? 28 : 4 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
              {demoMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t text-sm"
                  style={{
                    borderColor: "rgba(168, 85, 247, 0.2)",
                    color: COLORS.neutral.text.secondary,
                  }}
                >
                  All recommendations use preset stacks. No live
                  inventory data is accessed.
                </motion.div>
              )}
            </div>

            {/* Settings Card */}
            <motion.button
              onClick={() => setCurrentView("settings")}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl p-6 border text-left"
              style={{
                backgroundColor: COLORS.neutral.surface,
                borderColor: COLORS.neutral.border,
              }}
            >
              <div className="flex items-center justify-between">
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
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 1V3M12 21V23M23 12H21M3 12H1M20.49 20.49L19.07 19.07M4.93 4.93L3.51 3.51M20.49 3.51L19.07 4.93M4.93 19.07L3.51 20.49"
                        stroke={COLORS.foreground}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-lg font-medium"
                      style={{ color: COLORS.foreground }}
                    >
                      Settings
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: COLORS.neutral.text.secondary,
                      }}
                    >
                      System configuration
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
            onComplete={() => setShowOperatorDemo(false)}
            onExit={() => setShowOperatorDemo(false)}
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