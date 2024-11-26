import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const BlogLinkTemplate: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the template ID from the query string

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Fetch the template when the component loads and the ID is available
    if (id) {
      const fetchTemplate = async () => {
        try {
          const response = await fetch(`/api/code-templates/get-template?id=${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error fetching the template");
          }

          const templateData = await response.json();
          setTemplate(templateData.template);
        } catch (err: any) {
          setError(err.message || "An error occurred while fetching the template.");
        } finally {
          setLoading(false);
        }
      };

      fetchTemplate();
    }
  }, [id]);

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-4">{error}</p>;
  }

  if (!template) {
    return <p className="text-center mt-4">Template not found.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">{template.title}</h1>
        <p className="text-gray-700 mb-6">{template.explanation}</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          <code>{template.code}</code>
        </pre>
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            <strong>Tags:</strong> {template.tags.map((tag: any) => tag.name).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogLinkTemplate;
