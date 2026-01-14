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

  // Handler to close edit modal
  const handleCloseEdit = () => {
    setEditingPortfolio(null);
    setEditFormData({ title: "", url: "" });
  };

  // Handler to update portfolio - includes API call placeholder
  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio) return;

    try {
      setIsSaving(true);

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

    // Handler to delete portfolio
    const handleDelete = async (portfolioId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this portfolio? This action cannot be undone.");

        if (!confirmed) return;

        try {
            const res: Response = await fetch(`/api/portfolio/${portfolioId}/delete`, {
                method: "DELETE",
            })


            // Update UI
            setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        
        } catch (error) {
            console.error("Deletion failed: ", error);
            alert("Failed ot delete portfolio.");
        }
    }

  const statusConfig = {
    draft: {
      label: "Draft",
      color: "slate",
      bgColor: "bg-white/10",
      textColor: "text-white/80",
      dotColor: "bg-white/70",
    },
  };

  const getThumbnailGradient = (thumbnail: string) => {
    const gradients: Record<string, string> = {
      "gradient-1": "from-sky-600 via-cyan-700 to-teal-700",
      "gradient-2": "from-violet-600 via-purple-700 to-pink-700",
      "gradient-3": "from-orange-600 via-red-700 to-pink-700",
      "gradient-4": "from-emerald-600 via-teal-700 to-cyan-700",
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
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto"
          />
          <p className="mt-4 text-white/70 font-medium">Loading portfolios...</p>
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Portfolios
          </h1>
          <p className="text-white/70">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashboard/create")}
          className="hover:cursor-pointer hidden md:flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 hover:border-white/30 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
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
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transition-all">
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
                            className={`hover:cursor-pointer p-3 bg-white/10 hover:bg-white/20 rounded-xl shadow-lg hover:shadow-white/20 transition-all group/btn`}
                            title={action.label}
                          >
                            <action.icon
                              className={`w-5 h-5 text-white/80 group-hover/btn:text-white transition-colors`}
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
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {portfolio.title}
                  </h3>

                  {/* URL or Last Edited */}
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
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
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1 text-sm text-white/70">
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
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-4 h-4 text-white/70" />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenu === portfolio.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d21] rounded-xl shadow-2xl border border-white/10 py-2 z-10"
                          >
                            {[
                              {
                                icon: FiDownload,
                                label: "Export",
                                color: "sky",
                                onClick: () => { console.log("Export")}
                              },
                              {
                                icon: FiCopy,
                                label: "Duplicate",
                                color: "cyan",
                                onClick: () => { console.log("Duplicate")}
                              },
                              {
                                icon: FiTrash2,
                                label: "Delete",
                                color: "red",
                                onClick: () => handleDelete(portfolio.id),
                              },
                            ].map((action) => (
                              <button
                                key={action.label}
                                className={`w-full px-4 py-2 flex items-center gap-3 ${action.label === "Delete" ? "hover:bg-red-500/10" : "hover:bg-white/5"} transition-colors text-left group`}
                                onClick={action.onClick}
                              >
                                <action.icon
                                  className={`w-4 h-4 ${action.label === "Delete" ? "text-red-400" : action.label === "Export" ? "text-sky-400" : "text-cyan-400"}`}
                                />
                                <span className={`text-sm font-medium text-white ${action.label === "Delete" ? "group-hover:text-red-400" : ""}`}>
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
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center z-50 hover:bg-white/15 hover:border-white/30 transition-all"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseEdit}
          >
            {/* Modal content - prevents close when clicking inside */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1d21] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Portfolio</h2>
                <button
                  onClick={handleCloseEdit}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-white/70">&times;</span>
                </button>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Portfolio Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none transition-all text-white placeholder-white/50"
                    placeholder="Enter portfolio title"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Portfolio URL (optional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.url}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none transition-all text-white placeholder-white/50"
                    placeholder="yourname.portfolio.ai"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 border border-white/20 text-white/80 rounded-xl font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePortfolio}
                    disabled={isSaving || !editFormData.title.trim()}
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 hover:border-white/30 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
