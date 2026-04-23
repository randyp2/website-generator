import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
