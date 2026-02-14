import { motion } from "framer-motion";
import { MockPortfolio } from "../data/mockPortfolios";
import { PortfolioExploreCard } from "./PortfolioExploreCard";

interface ExploreGridProps {
  items: MockPortfolio[];
}

export function ExploreGrid({ items }: ExploreGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((portfolio, index) => (
        <motion.div
          key={portfolio.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.18) }}
        >
          <PortfolioExploreCard portfolio={portfolio} />
        </motion.div>
      ))}
    </div>
  );
}
