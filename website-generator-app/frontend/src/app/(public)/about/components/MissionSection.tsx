import { FiTrendingUp } from "react-icons/fi";

export default function MissionSection() {
    return (
        <article className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-3xl p-12 border border-cyan-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <FiTrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Our Mission
                        </h2>
                    </div>

                    <p className="text-lg text-slate-700 leading-relaxed mb-6">
                        We believe everyone deserves a professional online
                        presence. Too many talented individuals struggle with
                        web design or can&apos;t afford expensive developers.
                        PortRN democratizes professional web design, making it
                        accessible to everyone.
                    </p>

                    <p className="text-lg text-slate-700 leading-relaxed">
                        Our AI doesn&apos;t just generate templates — it
                        understands design principles, accessibility standards,
                        and modern aesthetics. Every portfolio is unique,
                        responsive, and ready to impress employers, clients, and
                        collaborators.
                    </p>
                </div>
            </div>
        </article>
    );
}
