import FeatureReadiness from "./portfolio/FeatureReadiness";
export default function Unavailable({
  title,
  reason,
}: {
  title: string;
  reason: string;
}) {
  return <FeatureReadiness title={title} reason={reason} />;
}
