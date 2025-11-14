export default function AboutSection() {

  return (
    <section className="py-20 px-6 bg-linear-to-br from-slate-50 to-cyan-50/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Intelligent Design, Effortless Creation
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Our AI understands design principles, accessibility standards, and
            modern web aesthetics. Simply provide your information and watch as a stunning, professional
            portfolio is crafted in real-time.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-600 mb-2">5min</div>
              <p className="text-slate-600 text-sm">Average Generation Time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-600 mb-2">10K+</div>
              <p className="text-slate-600 text-sm">Portfolios Created</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-600 mb-2">98%</div>
              <p className="text-slate-600 text-sm">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}