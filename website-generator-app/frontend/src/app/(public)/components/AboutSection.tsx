export default function AboutSection() {

  return (
    <section className="bg-transparent px-6 py-20 text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground">
            Intelligent Design, Effortless Creation
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Our AI understands design principles, accessibility standards, and
            modern web aesthetics. Simply provide your information and watch as a stunning, professional
            portfolio is crafted in real-time.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">5min</div>
              <p className="text-sm text-muted-foreground">Average Generation Time</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
              <p className="text-sm text-muted-foreground">Portfolios Created</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">98%</div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
