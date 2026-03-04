export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Brand Mark */}
      <div className="relative flex flex-col items-center">
        {/* Pulsing rings */}
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/5" />
        <div
          className="absolute h-20 w-20 animate-ping rounded-full bg-primary/10"
          style={{ animationDelay: "0.3s" }}
        />

        {/* Logo */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
          <span className="font-display text-2xl font-bold text-white">V</span>
        </div>

        {/* Brand name */}
        <h1 className="mt-6 font-display text-xl font-bold tracking-tight text-primary">
          Vastrayug
        </h1>

        {/* Loading indicator */}
        <div className="mt-6 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/60"
              style={{
                animation: "pulse-subtle 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <p className="mt-3 text-sm text-muted">Loading your experience...</p>
      </div>
    </div>
  );
}
