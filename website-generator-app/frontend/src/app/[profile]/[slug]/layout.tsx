/**
 * Isolated layout for public portfolio pages.
 * Resets the root layout's flex/font styles so AI-generated
 * sections render in a clean block-flow context — matching
 * how they look in the Sandpack preview.
 */
const ProfilePortfolioLayout = ({ children }: { children: React.ReactNode }) => (
    <div
        className="portfolio-isolate"
        style={{
            display: "block",
            position: "relative",
            minHeight: "100vh",
            isolation: "isolate",
        }}
    >
        {children}
    </div>
);

export default ProfilePortfolioLayout;
