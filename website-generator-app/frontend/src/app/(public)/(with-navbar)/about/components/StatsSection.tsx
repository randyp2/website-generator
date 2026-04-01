const stats = [
  { value: "10K+", label: "Portfolios Created" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "5min", label: "Avg. Generation Time" },
  { value: "24/7", label: "Always Available" },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-6 bg-linear-to-br from-slate-50 to-cyan-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2">
                {stat.value}
              </div>
              <p className="text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
