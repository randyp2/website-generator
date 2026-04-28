import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import { PublicAuthGateProvider } from "@/context/PublicAuthGateContext";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PublicAuthGateProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </PublicAuthGateProvider>
    );
}
