import { FiArrowRight } from "react-icons/fi";

export default function ProcessSection() {
  const process = [
    {
      step: "01",
      title: "Enter Your Info",
      description:
        "Fill out a simple form with your name, skills, experience, and contact information. Or simply upload your resume any media files.",
    },
    {
      step: "02",
      title: "Choose a Theme",
      description:
        "Select from 5 professionally designed themes or customize by prompting our AI service with your own custom theme.",
    },
    {
      step: "03",
      title: "Generate Portfolio",
      description:
        "Our AI creates a stunning portfolio in seconds, complete with responsive design and animations.",
    },
    {
      step: "04",
      title: "Download & Deploy",
      description:
        "Get your HTML/CSS code and deploy to any hosting platform. It's that simple.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Four simple steps to your professional portfolio
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {process.map((item, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-cyan-100 mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Arrow for desktop */}
              {index < process.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 text-cyan-200">
                  <FiArrowRight className="w-8 h-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
