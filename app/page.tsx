"use client";

import { useState } from "react";

type UploadStatus =
  | { state: "idle" }
  | { state: "uploading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export default function Home() {
  const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setStatus({ state: "error", message: "Please choose a file to upload." });
      return;
    }

    setStatus({ state: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Upload failed.");
      }

      setStatus({
        state: "success",
        message: `Stored in vector store ${data.vectorStoreId}.`
      });
      setFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setStatus({ state: "error", message });
    }
  };

  return (
    <main>
      <section className="card">
        <header>
          <h1>Vector Store Loader</h1>
          <p>Upload a document and store it in an OpenAI vector store.</p>
        </header>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="file"
            name="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button type="submit" disabled={status.state === "uploading"}>
            {status.state === "uploading" ? "Uploading..." : "Upload to Vector Store"}
          </button>
        </form>
        {status.state !== "idle" && (
          <div className="status" role="status">
            <strong>
              {status.state === "success" ? "Success" : status.state === "error" ? "Error" : "Uploading"}
            </strong>
            <span>
              {status.state === "uploading"
                ? "Sending your file to OpenAI..."
                : status.message}
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
