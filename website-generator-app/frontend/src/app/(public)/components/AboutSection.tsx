export default function AboutSection() {

  return (
    <section className="bg-transparent px-6 py-20 text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-12 text-center dark:border dark:border-[#050a72]/28 dark:bg-linear-to-br dark:from-[#081038]/84 dark:via-[#09112a]/80 dark:to-[#040811]/92 dark:shadow-[0_24px_64px_rgba(5,10,114,0.2)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[#050a72]/14 to-transparent dark:block" />
          <h2 className="mb-6 text-4xl font-bold text-foreground">
            Intelligent Design, Effortless Creation
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Our AI understands design principles, accessibility standards, and
            modern web aesthetics. Simply provide your information and watch as a stunning, professional
            portfolio is crafted in real-time.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center dark:rounded-2xl dark:border dark:border-[#050a72]/24 dark:bg-[#050a72]/10 dark:px-4 dark:py-5">
              <div className="mb-2 text-4xl font-bold text-primary">5min</div>
              <p className="text-sm text-muted-foreground">Average Generation Time</p>
            </div>
            <div className="text-center dark:rounded-2xl dark:border dark:border-[#050a72]/24 dark:bg-[#050a72]/10 dark:px-4 dark:py-5">
              <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
              <p className="text-sm text-muted-foreground">Portfolios Created</p>
            </div>
            <div className="text-center dark:rounded-2xl dark:border dark:border-[#050a72]/24 dark:bg-[#050a72]/10 dark:px-4 dark:py-5">
              <div className="mb-2 text-4xl font-bold text-primary">98%</div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
