import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { useTestimonials } from '../../hooks/useTestimonials';
import { useToast } from '../../hooks/useToast';
import { MessageCircle, Star, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

export default function Testimonials() {
  const { data: testimonials, loading, error, createItem, updateItem, deleteItem } = useTestimonials();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    rating: 5,
    photo: ''
  });
  const [imageUploading, setImageUploading] = useState(false);

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'review',
      title: 'Review',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (value) => renderStars(value)
    }
  ];

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      review: testimonial.review || '',
      rating: testimonial.rating || 5,
      photo: testimonial.photo || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (testimonial) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteItem(testimonial.id);
        addToast('Testimonial deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting testimonial: ' + error.message, 'error');
      }
    }
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      review: '',
      rating: 5,
      photo: ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const fileRef = ref(storage, `testimonials/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      setFormData(prev => ({
        ...prev,
        photo: url
      }));
      
      addToast('Image uploaded successfully!', 'success');
    } catch (error) {
      addToast('Error uploading image: ' + error.message, 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.review) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const testimonialData = {
        ...formData,
        createdAt: new Date()
      };
      
      if (editingTestimonial) {
        await updateItem(editingTestimonial.id, testimonialData);
        addToast('Testimonial updated successfully!', 'success');
      } else {
        await createItem(testimonialData);
        addToast('Testimonial created successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving testimonial: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        Error loading testimonials: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage customer testimonials
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={testimonials}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Customer Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rating
            </label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="text-gray-300 hover:text-yellow-400 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : ''}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">({formData.rating} stars)</span>
            </div>
          </div>

          <FormField
            label="Review"
            id="review"
            name="review"
            value={formData.review}
            onChange={handleChange}
            placeholder="Enter customer review"
            textarea
            rows={4}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer Photo
            </label>
            {formData.photo && (
              <div className="mt-2">
                <img 
                  src={formData.photo} 
                  alt="Customer" 
                  className="w-16 h-16 object-cover rounded-full"
                />
              </div>
            )}
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {imageUploading && (
                <div className="flex items-center mt-2">
                  <Spinner size="sm" className="mr-2" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full">
              {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
          </CardFooter>
        </form>
      </Modal>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          show={true}
          onClose={() => {}}
        />
      ))}
    </div>
  );
}