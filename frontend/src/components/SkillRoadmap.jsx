export default function SkillRoadmap({ roadmapData }) {
  return (
    <div style={{ marginTop: 20 }}>
      <p>Missing: {roadmapData.missing_skills.join(", ")}</p>
    </div>
  );
}