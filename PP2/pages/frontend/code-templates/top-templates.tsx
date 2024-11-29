// logic from chatgpt, prompt was "using search-templates and view-templates, create a frontend that displays top three templates"
import React, { useState, useEffect } from "react";

interface Template {
  id: number;
  title: string;
  explanation: string;
  code: string;
  tags: { name: string }[];
}

const TopTemplates: React.FC = () => {
  const [topTemplates, setTopTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch top 3 templates from the backend
  const fetchTopTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/code-templates/top-templates");
      if (!response.ok) {
        throw new Error(`Failed to fetch top templates: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Top Templates Response:", data); // Debug log
      setTopTemplates(data.templates || []);
    } catch (err) {
      console.error("Fetch Error:", err); // Debug log
      setError(err.message || "An error occurred while fetching top templates.");
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchTopTemplates();
  }, []);

  if (loading) {
    return <p className="text-left text-gray-500">Loading top templates...</p>;
  }

  if (error) {
    return <p className="text-left text-red-500">{error}</p>;
  }

  return (
    <div className="mt-8 p-4 bg-white dark:bg-zinc-900 shadow-lg rounded-lg w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-left">
        Top 3 Templates
      </h2>
      {topTemplates.length > 0 ? (
        <ul className="space-y-4">
          {topTemplates.map((template) => (
            <li
              key={template.id}
              className="p-4 border rounded-lg shadow-sm dark:border-gray-600 dark:bg-zinc-800 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {template.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {template.explanation}
              </p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-scroll mt-2">
                {template.code}
              </pre>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                <strong>Tags:</strong> {template.tags.map((tag) => tag.name).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-left text-gray-500 dark:text-gray-300">
          No templates available.
        </p>
      )}
    </div>
  );
};

export default TopTemplates;
