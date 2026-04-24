"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  FolderKanban,
  LayoutGrid,
  Menu,
  Type,
  User,
} from "lucide-react";

interface DraggingComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  placed: boolean;
  placedPosition?: { x: number; y: number; width: string; height: string };
}

interface ComponentDefinition {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PlacedPosition {
  x: number;
  y: number;
  width: string;
  height: string;
}

const componentsList: ComponentDefinition[] = [
  { id: "navbar", name: "Navbar", icon: <Menu className="w-4 h-4" /> },
  { id: "hero", name: "Hero", icon: <Type className="w-4 h-4" /> },
  { id: "about", name: "About", icon: <User className="w-4 h-4" /> },
  { id: "projects", name: "Projects", icon: <FolderKanban className="w-4 h-4" /> },
  { id: "experience", name: "Experience", icon: <Briefcase className="w-4 h-4" /> },
];

const placedPositions: PlacedPosition[] = [
  { x: 10, y: 10, width: "calc(100% - 20px)", height: "35px" },
  { x: 10, y: 55, width: "calc(100% - 20px)", height: "70px" },
  { x: 10, y: 135, width: "calc(100% - 20px)", height: "55px" },
  { x: 10, y: 200, width: "calc(100% - 20px)", height: "55px" },
  { x: 10, y: 265, width: "calc(100% - 20px)", height: "45px" },
];

const createInitialComponents = (): DraggingComponent[] =>
  componentsList.map((component, index) => ({
    ...component,
    x: -100,
    y: 80 + index * 45,
    targetX: 50,
    targetY: 150,
    placed: false,
  }));

export const ComponentDragLoader = (): React.JSX.Element => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [components, setComponents] = useState<DraggingComponent[]>(
    createInitialComponents
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);

  useEffect(() => {
    const sequence = async () => {
      if (activeIndex >= components.length) {
        // Reset after all components placed
        setTimeout(() => {
          setComponents(createInitialComponents());
          setActiveIndex(0);
        }, 2000);
        return;
      }

      // Start drag animation
      setIsDragging(true);
      setDragProgress(0);

      // Animate drag progress
      const dragInterval = setInterval(() => {
        setDragProgress((prev) => {
          if (prev >= 100) {
            clearInterval(dragInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 20);

      // Wait for drag to complete
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Place component
      setComponents((prev) =>
        prev.map((component, index) =>
          index === activeIndex
            ? {
                ...component,
                placed: true,
                placedPosition: placedPositions[index],
              }
            : component
        )
      );

      setIsDragging(false);
      setDragProgress(0);

      // Move to next component
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveIndex((prev) => prev + 1);
    };

    void sequence();
  }, [activeIndex, components.length]);

  const activeComponent = components[activeIndex];

  // Calculate current drag position
  const startX = -60;
  const startY = 80 + activeIndex * 45;
  const endX = 200;
  const endY = placedPositions[activeIndex]?.y ?? 150;

  const currentX = startX + (endX - startX) * (dragProgress / 100);
  const currentY = startY + (endY - startY) * (dragProgress / 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Browser Frame */}
      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-background/80 rounded-lg border border-border/50 min-w-[200px]">
              <div className="w-3 h-3 rounded-full bg-violet-500/60" />
              <span className="text-xs text-muted-foreground font-mono">preview.v0.dev</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-[400px]">
          {/* Component Sidebar */}
          <div className="w-32 bg-zinc-900 border-r border-zinc-800 p-3 relative">
            <div className="text-xs text-zinc-500 font-medium mb-3">Components</div>
            <div className="space-y-2">
              {components.map((component, index) => (
                <div
                  key={component.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-300 ${
                    component.placed
                      ? "opacity-30 bg-zinc-800/50"
                      : index === activeIndex && isDragging
                        ? "opacity-0"
                        : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {component.icon}
                  <span className="font-mono">{component.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-zinc-950 relative overflow-hidden">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Placed Components */}
            {components.map(
              (component, index) =>
                component.placed &&
                component.placedPosition && (
                  <div
                    key={component.id}
                    className="absolute bg-zinc-800/80 border border-zinc-700 rounded-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-300"
                    style={{
                      left: component.placedPosition.x,
                      top: component.placedPosition.y,
                      width: component.placedPosition.width,
                      height: component.placedPosition.height,
                    }}
                  >
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      {componentsList[index].icon}
                      <span className="text-xs font-mono">{component.name}</span>
                    </div>
                  </div>
                )
            )}

            {/* Drop Target Indicator */}
            {isDragging && activeIndex < components.length && placedPositions[activeIndex] && (
              <div
                className="absolute border-2 border-dashed border-violet-500/50 rounded-md animate-pulse"
                style={{
                  left: placedPositions[activeIndex].x,
                  top: placedPositions[activeIndex].y,
                  width: placedPositions[activeIndex].width,
                  height: placedPositions[activeIndex].height,
                }}
              />
            )}

            {/* Dragging Component */}
            {isDragging && activeComponent && (
              <div
                className="absolute z-50 transition-none"
                style={{
                  left: currentX,
                  top: currentY,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-500 text-white rounded-lg shadow-xl shadow-violet-500/30 text-xs font-mono">
                  {activeComponent.icon}
                  <span>{activeComponent.name}</span>
                </div>
                {/* Cursor */}
                <div className="absolute -bottom-2 -right-2 w-4 h-4">
                  <svg viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
                    <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Empty State */}
            {components.every((c) => !c.placed) && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-zinc-600">
                  <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-mono">Drop components here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-mono">
              {activeIndex >= components.length
                ? "Layout complete"
                : `Placing ${activeComponent?.name}...`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {components.map((c, i) => (
              <div
                key={c.id}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  c.placed
                    ? "bg-emerald-500"
                    : i === activeIndex
                      ? "bg-violet-500 animate-pulse"
                      : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
