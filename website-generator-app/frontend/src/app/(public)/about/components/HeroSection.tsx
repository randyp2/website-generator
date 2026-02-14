export default function HeroSection() {
    return (
        <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                        Professional Portfolios,{" "}
                        <span className="bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                            Effortlessly Created
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed mb-8">
                        We built PortRN to help professionals showcase their
                        work without spending weeks on design and development.
                        Our AI understands what makes portfolios effective and
                        creates beautiful, responsive sites in minutes. Simply
                        upload your resume and media files, or prompt AI to
                        generate content for you.
                    </p>
                </div>
            </div>
        </section>
    );
}
