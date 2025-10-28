import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CommunityService } from "@/services/api/communityService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";

const CreateCommunityModal = ({ isOpen, onClose, onCommunityCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Users",
    color: "#FF4500"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableIcons = [
    "Users", "Code", "Dumbbell", "ChefHat", "Briefcase", "Camera",
    "CheckSquare", "PawPrint", "Book", "Leaf", "Rocket", "Music",
    "Gamepad2", "Paintbrush", "Heart", "Star", "Trophy", "Zap"
  ];

  const availableColors = [
    "#FF4500", "#61DAFB", "#FF6B6B", "#4ECDC4", "#45B7D1",
    "#96CEB4", "#FFEAA7", "#DDA0DD", "#F39C12", "#27AE60",
    "#E74C3C", "#3498DB", "#9B59B6", "#1ABC9C", "#E67E22"
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        icon: "Users",
        color: "#FF4500"
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Community name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Community name must be at least 3 characters";
    } else if (formData.name.length > 21) {
      newErrors.name = "Community name must be less than 21 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.name)) {
      newErrors.name = "Community name can only contain letters, numbers, and underscores";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await CommunityService.create(formData);
      toast.success(`r/${formData.name} created successfully!`);
      onCommunityCreated();
    } catch (error) {
      toast.error("Failed to create community. Please try again.");
      console.error("Error creating community:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Create Community</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Community Name */}
          <Input
            label="Community Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., webdev, fitness, cooking"
            error={errors.name}
            required
          />

          {/* Description */}
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="What is your community about?"
            rows={4}
            error={errors.description}
            required
          />

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Community Icon
            </label>
            <div className="grid grid-cols-6 gap-3">
              {availableIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange("icon", icon)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ApperIcon name={icon} size={24} className="mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Community Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {availableColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange("color", color)}
                  className={`w-full h-12 rounded-lg transition-all ${
                    formData.color === color
                      ? "ring-4 ring-offset-2 ring-primary"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: formData.color }}
              >
                <ApperIcon name={formData.icon} size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">
                  r/{formData.name || "communityname"}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {formData.description || "Community description will appear here"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;