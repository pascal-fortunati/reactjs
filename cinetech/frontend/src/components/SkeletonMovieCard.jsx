function SkeletonMovieCard() {
  return (
    <div className="h-full animate-pulse rounded-md border border-neutral-800 bg-neutral-950/80">
      <div className="aspect-[2/3] bg-neutral-800" />
      <div className="flex flex-col gap-2 px-2 pb-2 pt-3">
        <div className="h-3 w-3/4 rounded bg-neutral-800" />
        <div className="h-3 w-1/3 rounded bg-neutral-800" />
      </div>
    </div>
  )
}

export default SkeletonMovieCard
