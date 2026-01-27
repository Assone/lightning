interface ProfileSummaryProps {
  name: string;
  subtitle?: string;
}

export const ProfileSummary = ({ name, subtitle }: ProfileSummaryProps) => {
  return (
    <div className="flex flex-col text-right">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        Profile
      </span>
      <span className="font-medium text-foreground text-sm">{name}</span>
      {subtitle ? (
        <span className="text-muted-foreground text-xs">{subtitle}</span>
      ) : null}
    </div>
  );
};
