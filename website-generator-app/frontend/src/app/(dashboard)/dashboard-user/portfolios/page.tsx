"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiCopy,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiGlobe,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

interface Portfolio {
  id: string;
  title: string;
  thumbnail: string;
  status: "draft";
  lastEdited: string;
  views: number;
  url?: string;
}

const PortfolioManager: React.FC = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // NEW: State for edit modal - tracks which portfolio is being edited
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editFormData, setEditFormData] = useState({ title: "", url: "" });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Extract user from context
  const { user } = useUser();
  const { id: userId } = user;


  // API call to fetch portfolios - Occurs on mount
  useEffect(() => {

    const handleFetchPortfolios = async () => {
      try {
        setLoading(true);

        // Make api call to fetch portfolios
        const response: Response = await fetch(`/api/portfolio/list?userId=${userId}`, {
          method: "GET",
        });

        if (!response.ok ) throw new Error(`HTTP error! status: ${response.status}`);
        

        const data = await response.json();

        // Convert DB Rows to card format
        const formattedPortfolios: Portfolio[] = data.portfolios.map((item: any) => ({
          id: item.id,
          title: item.title,
          thumbnail: "graident-1", // Placeholder - replace with actual thumbnail logic
          status: item.status,
          lastEdited: new Date(item.updated_at ?? item.created_at).toLocaleDateString(), // Format as needed
          views: 0, // Placeholder - replace with actual views logic
          url: item.url ?? "unpublished",
        }));

        setPortfolios(formattedPortfolios);

      } catch (err) {
        console.error("Error fetching portfolios:", err);
        alert("Failed to fetch portfolios. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    handleFetchPortfolios();
  }, [user?.id]);

  // Handler to open edit modal - triggered when user clicks Edit icon
  const handleEditClick = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setEditFormData({
      title: portfolio.title,
      url: portfolio.url || "",
    });
    setActiveMenu(null); // Close any open menus
  };

  // NEW: Handler to close edit modal
  const handleCloseEdit = () => {
    setEditingPortfolio(null);
    setEditFormData({ title: "", url: "" });
  };

  // Handler to update portfolio - includes API call placeholder
  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio) return;

    try {
      setIsSaving(true);

      // TODO: BACKEND API CALL - Update portfolio in Supabase
      // This will call your backend endpoint to update the portfolio record
      const response = await fetch(`/api/portfolio/${editingPortfolio.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editFormData.title,
          // Include other fields if neede
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update portfolio: ${response.status}`);
      }

      const updatedData = await response.json();

      // Update local state to reflect changes immediately
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === editingPortfolio.id
            ? {
                ...p,
                title: editFormData.title,
                url: editFormData.url,
                lastEdited: new Date().toLocaleDateString(),
              }
            : p
        )
      );

      // Close modal and show success
      handleCloseEdit();
      alert("Portfolio updated successfully!");
    } catch (error) {
      console.error("Error updating portfolio:", error);
      alert("Failed to update portfolio. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // // Mock portfolios - replace with real data
  // const portfolios: Portfolio[] = [
  //   {
  //     id: "1",
  //     title: "Software Engineer Portfolio",
  //     thumbnail: "gradient-1",
  //     status: "draft",
  //     lastEdited: "2 hours ago",
  //     views: 234,
  //     url: "johndoe.portfolio.ai",
  //   },
  // ];

  const statusConfig = {
    draft: {
      label: "Draft",
      color: "slate",
      bgColor: "bg-slate-100",
      textColor: "text-slate-700",
      dotColor: "bg-slate-500",
    },
  };

  const getThumbnailGradient = (thumbnail: string) => {
    const gradients: Record<string, string> = {
      "gradient-1": "from-sky-400 via-cyan-400 to-teal-400",
      "gradient-2": "from-violet-400 via-purple-400 to-pink-400",
      "gradient-3": "from-orange-400 via-red-400 to-pink-400",
      "gradient-4": "from-emerald-400 via-teal-400 to-cyan-400",
    };
    return gradients[thumbnail] || gradients["gradient-1"];
  };

  // Loading screen component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full mx-auto"
          />
          <p className="mt-4 text-slate-600 font-medium">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Your Portfolios
          </h1>
          <p className="text-slate-600">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashboard/create")}
          className="hover:cursor-pointer hidden md:flex items-center gap-2 px-6 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all"
        >
          <FiPlus className="w-5 h-5" />
          New Portfolio
        </motion.button>
      </motion.div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio, index) => {
          const status = statusConfig[portfolio.status];

          return (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredId(portfolio.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative hover:cursor-pointer"
            >
              {/* Card Container */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow border border-white/40 shadow-lg hover:shadow-2xl transition-all">
                {/* Thumbnail with linear */}
                <div className="relative h-48 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${getThumbnailGradient(
                      portfolio.thumbnail
                    )}`}
                  >
                    {/* Overlay pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[24px_24px]" />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 ${status.bgColor} backdrop-blur-sm rounded-full text-xs font-semibold ${status.textColor}`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-1.5 h-1.5 ${status.dotColor} rounded-full`}
                      />
                      {status.label}
                    </div>
                  </div>

                  {/* Quick Actions Overlay (on hover) */}
                  <AnimatePresence>
                    {hoveredId === portfolio.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center gap-3"
                      >
                        {/* UPDATED: Added onClick handlers to quick action icons */}
                        {[
                          { icon: FiEye, label: "Preview", onClick: () => {} },
                          { icon: FiEdit2, label: "Edit", onClick: () => handleEditClick(portfolio) },
                          { icon: FiCopy, label: "Duplicate", onClick: () => {} },
                        ].map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.onClick}
                            className={`hover:cursor-pointer p-3 bg-white/90 hover:bg-sky-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow group/btn`}
                            title={action.label}
                          >
                            <action.icon
                              className={`w-5 h-5 text-slate-700 group-hover/btn:text-sky-600 transition-colors`}
                            />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                    {portfolio.title}
                  </h3>

                  {/* URL or Last Edited */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    {portfolio.url ? (
                      <>
                        <FiGlobe className="w-4 h-4" />
                        <span className="truncate">{portfolio.url}</span>
                      </>
                    ) : (
                      <span>Edited {portfolio.lastEdited}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <FiEye className="w-4 h-4" />
                      <span>{portfolio.views} views</span>
                    </div>

                    {/* More Actions Menu */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === portfolio.id ? null : portfolio.id
                          )
                        }
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-4 h-4 text-slate-600" />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenu === portfolio.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10"
                          >
                            {[
                              {
                                icon: FiDownload,
                                label: "Export",
                                color: "sky",
                              },
                              {
                                icon: FiCopy,
                                label: "Duplicate",
                                color: "cyan",
                              },
                              { icon: FiTrash2, label: "Delete", color: "red" },
                            ].map((action) => (
                              <button
                                key={action.label}
                                className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-${action.color}-50 transition-colors text-left`}
                              >
                                <action.icon
                                  className={`w-4 h-4 text-${action.color}-600`}
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {action.label}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/dashboard/create")}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full shadow-2xl shadow-sky-400/50 flex items-center justify-center z-50"
      >
        <FiPlus className="w-7 h-7" />
      </motion.button>

      {/* NEW: Edit Portfolio Modal Overlay */}
      <AnimatePresence>
        {editingPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseEdit}
          >
            {/* Modal content - prevents close when clicking inside */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Edit Portfolio</h2>
                <button
                  onClick={handleCloseEdit}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-slate-600">&times;</span>
                </button>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Portfolio Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter portfolio title"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Portfolio URL (optional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.url}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, url: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    placeholder="yourname.portfolio.ai"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePortfolio}
                    disabled={isSaving || !editFormData.title.trim()}
                    className="flex-1 px-4 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed "
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioManager;
