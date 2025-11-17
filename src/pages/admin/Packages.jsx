import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { usePackages } from '../../hooks/usePackages';
import { useToast } from '../../hooks/useToast';
import { Package, Plus, DollarSign } from 'lucide-react';

export default function Packages() {
  const { data: packages, loading, error, createItem, updateItem, deleteItem } = usePackages();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    features: [''],
    popular: false,
    order: 0
  });

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'price',
      title: 'Price',
      render: (value) => <span className="font-medium">${value}</span>
    },
    {
      key: 'popular',
      title: 'Popular',
      render: (value) => (
        value ? 
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Popular
        </span> : 
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Standard
        </span>
      )
    },
    {
      key: 'order',
      title: 'Order'
    }
  ];

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price || '',
      features: pkg.features || [''],
      popular: pkg.popular || false,
      order: pkg.order || packages.length
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (pkg) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deleteItem(pkg.id);
        addToast('Package deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting package: ' + error.message, 'error');
      }
    }
  };

  const handleAddNew = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      features: [''],
      popular: false,
      order: packages.length + 1
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      // Convert price to number
      const packageData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      if (editingPackage) {
        await updateItem(editingPackage.id, packageData);
        addToast('Package updated successfully!', 'success');
      } else {
        await createItem(packageData);
        addToast('Package created successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving package: ' + error.message, 'error');
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
        Error loading packages: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Packages</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your event packages
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Package className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={packages}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? "Edit Package" : "Add New Package"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Package Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter package name"
            required
          />

          <FormField
            label="Description"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter package description"
            textarea
            rows={3}
          />

          <FormField
            label="Price ($)"
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <FormField
                  id={`feature-${index}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Enter feature"
                  className="flex-1"
                />
                {formData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="popular"
              name="popular"
              type="checkbox"
              checked={formData.popular}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="popular" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mark as Popular Package
            </label>
          </div>

          <FormField
            label="Order"
            id="order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            placeholder="Enter display order"
          />

          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full">
              {editingPackage ? 'Update Package' : 'Add Package'}
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