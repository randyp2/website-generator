import { FiZap, FiClock, FiSliders, FiAward, FiShield, FiCode } from "react-icons/fi";

const features = [
  {
    icon: <FiZap className="w-6 h-6" />,
    title: "AI-Powered",
    description:
      "Advanced AI algorithms understand design principles and create portfolios that look professionally crafted.",
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: "Lightning Fast",
    description:
      "Generate a complete portfolio in under 5 minutes. No coding required, no design skills needed.",
  },
  {
    icon: <FiSliders className="w-6 h-6" />,
    title: "Fully Customizable",
    description:
      "Choose from 5 professional themes and add custom sections, colors, and content to match your brand.",
  },
  {
    icon: <FiAward className="w-6 h-6" />,
    title: "Premium Quality",
    description:
      "Every generated portfolio meets professional standards with responsive design and accessibility built-in.",
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Secure & Private",
    description:
      "Your data is encrypted and never shared. Generate portfolios with confidence and peace of mind.",
  },
  {
    icon: <FiCode className="w-6 h-6" />,
    title: "Export Ready",
    description:
      "Download clean HTML/CSS code ready to deploy anywhere. Host on your domain or ours.",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built with the latest web technologies and design best practices
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-cyan-100 transition-all"
            >
              <div className="w-12 h-12 bg-linear-to-br from-cyan-50 to-teal-50 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
