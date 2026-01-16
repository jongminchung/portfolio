export default function RaindropBanner() {
  return (
    <div className="rounded-2xl border border-border border-dashed bg-muted/40 px-5 py-4 text-muted-foreground text-sm">
      <span className="font-medium text-foreground">
        Bookmarks are unavailable in this environment.
      </span>{" "}
      Set <span className="font-mono">RAINDROP_ACCESS_TOKEN</span> to enable the
      Raindrop integration.
    </div>
  );
}
