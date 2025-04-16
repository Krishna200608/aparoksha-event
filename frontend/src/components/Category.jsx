import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const CategoryForm = ({ onClose }) => {
  const { backendUrl } = useContext(AppContext);
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const payload = { categoryName };

      const { data } = await axios.post(
        `${backendUrl}/api/events/add-category`,
        payload
      );

      if (data.success) {
        toast.success(data.message);
        setCategoryName("");
        onClose(); // Close the modal on successful submission.
        // Optionally call refreshCategories() from context if available.
      }
    } catch (err) {
      console.error("Error submitting category:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while adding the category.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm"></div>

      {/* Modal container with the form */}
      <div className="relative z-10">
        <div className="p-8 rounded-lg shadow-md max-w-lg w-[450px] mx-auto bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Add Category</h2>
            <button
              onClick={onClose}
              className="text-red-500 font-bold cursor-pointer"
            >
              Back
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-gray-700">
                Category Name*
              </label>
              <input
                autoComplete="off"
                type="text"
                id="categoryName"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[#cd92cd]"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E3CCE3] via-[#cd92cd] to-[#E3CCE3]
              hover:from-[#cd92cd] hover:via-[#b54eb5] hover:to-[#a441a4]
              text-black py-2 px-4 rounded-md cursor-pointer
              transition-colors duration-100"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Category = () => {
  const { categories, backendUrl, refreshCategories } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedDeleteCategory, setSelectedDeleteCategory] = useState(null);

  const handleDeleteCategory = async (categoryID) => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/events/delete-category`,
        { categoryID }
      );

      if (data.success) {
        toast.success(data.message);
        // Refresh categories if a refresh method is provided in the context.
        if (refreshCategories) refreshCategories();
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage =
        err.response?.data?.message || "Error deleting category.";
      toast.error(errorMessage);
    } finally {
      setSelectedDeleteCategory(null);
    }
  };

  return (
    <div className="relative mt-30">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay with blur */}
          <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
          {/* Modal dialog */}
          <div className="z-50">
            <CategoryForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {selectedDeleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay with blur */}
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-50 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-md text-gray-800 font-medium">
              Delete category? All associated events will be removed.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedDeleteCategory(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(selectedDeleteCategory)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Categories</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#E3CCE3] hover:bg-[#cd92cd] text-black py-2 px-4 rounded"
            >
              Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.categoryID}
                  className="bg-white p-4 rounded shadow-md relative flex flex-col items-center"
                >
                  <h2 className="text-2xl font-semibold mb-2">
                    {category.categoryName}
                  </h2>
                  {/* Delete button for category */}
                  <button
                    onClick={() => setSelectedDeleteCategory(category.categoryID)}
                    className="absolute cursor-pointer top-2 right-2 text-red-500 hover:text-red-700"
                    title="Delete Category"
                  >
                    &#x2716;
                  </button>
                </div>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
