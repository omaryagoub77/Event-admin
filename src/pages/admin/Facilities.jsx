import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { useFacilities } from '../../hooks/useFacilities';
import { useToast } from '../../hooks/useToast';
import { Building, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

export default function Facilities() {
  const { data: facilities, loading, error, createItem, updateItem, deleteItem } = useFacilities();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    description: '',
    order: 0
  });
  const [imageUploading, setImageUploading] = useState(false);

  const columns = [
    {
      key: 'title',
      title: 'Title',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'icon',
      title: 'Icon',
      render: (value) => value || 'No icon'
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'order',
      title: 'Order'
    }
  ];

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      title: facility.title || '',
      icon: facility.icon || '',
      description: facility.description || '',
      order: facility.order || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (facility) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await deleteItem(facility.id);
        addToast('Facility deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting facility: ' + error.message, 'error');
      }
    }
  };

  const handleAddNew = () => {
    setEditingFacility(null);
    setFormData({
      title: '',
      icon: '',
      description: '',
      order: facilities.length + 1
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const fileRef = ref(storage, `facilities/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      setFormData(prev => ({
        ...prev,
        icon: url
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
    
    try {
      if (editingFacility) {
        await updateItem(editingFacility.id, formData);
        addToast('Facility updated successfully!', 'success');
      } else {
        await createItem(formData);
        addToast('Facility created successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving facility: ' + error.message, 'error');
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
        Error loading facilities: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facilities</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your venue facilities
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Building className="mr-2 h-4 w-4" />
          Add Facility
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facilities List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={facilities}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? "Edit Facility" : "Add New Facility"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter facility title"
            required
          />

          <FormField
            label="Description"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter facility description"
            textarea
            rows={3}
            required
          />

          <FormField
            label="Order"
            id="order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            placeholder="Enter display order"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icon
            </label>
            {formData.icon && (
              <div className="mt-2">
                <img 
                  src={formData.icon} 
                  alt="Facility icon" 
                  className="w-16 h-16 object-cover rounded-lg"
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
              {editingFacility ? 'Update Facility' : 'Add Facility'}
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