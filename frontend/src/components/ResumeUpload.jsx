import api from "../api/api";

export default function ResumeUpload({ onResult }) {
  const upload = async (e) => {
    const form = new FormData();
    form.append("file", e.target.files[0]);
    const res = await api.post("/resume/analyze", form);
    onResult(res.data);
  };

  return <input type="file" accept=".pdf" onChange={upload} />;
}