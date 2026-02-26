import { useEffect, useState } from "react";
import api from "../api/api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/jobs/").then((res) => setJobs(res.data));
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      {jobs.map((job) => (
        <div key={job.id}>
          <p>{job.title} - {job.company}</p>
        </div>
      ))}
    </div>
  );
}