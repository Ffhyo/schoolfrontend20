import  { useState, type ChangeEvent, type FormEvent } from "react";

export default function HeroSection() {
  // State types
  const [mainTitle, setMainTitle] = useState<string>("");
  const [subheadline, setSubheadline] = useState<string>("");
  const [heroImage, setHeroImage] = useState<File | null>(null);
const API_BASE_URL ='https://schoolbackend-un9x.onrender.com'
  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!mainTitle || !subheadline || !heroImage) {
      alert("Please fill all fields and select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("mainTitle", mainTitle);
    formData.append("subheadline", subheadline);
    formData.append("heroImage", heroImage);

    try {
      const response = await fetch(`${API_BASE_URL}/api/heroes`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Hero section data submitted successfully!");
        setMainTitle("");
        setSubheadline("");
        setHeroImage(null);
      } else {
        const errorData = await response.json();
        alert("Error submitting data: " + errorData.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while submitting data.");
    }
  };

  // Handle file change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImage(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6">
      <h2 className="text-3xl font-bold text-green-700 mb-6 border-b pb-2">
        Hero Section Management
      </h2>

      <form
        className="flex flex-col gap-5 bg-white shadow-md rounded-lg p-6 border border-gray-200"
        onSubmit={handleSubmit}
      >
        {/* Main Title */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Main Title</label>
          <input
            type="text"
            placeholder="Enter main title..."
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Subheadline */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Subheadline</label>
          <input
            type="text"
            placeholder="Enter subheadline..."
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Image Upload */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-semibold mb-1">Hero Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-4 py-2 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="self-start mt-4 bg-green-600 text-white font-semibold px-6 py-2 rounded hover:bg-green-700 transition-colors duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
