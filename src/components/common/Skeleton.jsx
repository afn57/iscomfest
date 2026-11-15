import { cn } from '../../utils/cn';
export function Skeleton({ className }) {
    return <div className={cn('animate-shimmer rounded-lg bg-surface-2', className)}/>;
}
export function CardSkeleton() {
    return (<div className="rounded-card border border-line bg-surface p-5 space-y-3">
      <Skeleton className="h-3 w-24"/>
      <Skeleton className="h-7 w-32"/>
      <Skeleton className="h-3 w-40"/>
    </div>);
}
export function RowSkeleton() {
    return (<div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
      <Skeleton className="size-9 rounded-lg"/>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5"/>
        <Skeleton className="h-3 w-1/4"/>
      </div>
      <Skeleton className="h-6 w-16 rounded-full"/>
    </div>);
}
