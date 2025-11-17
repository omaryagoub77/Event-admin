import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { usePolicies } from '../../hooks/usePolicies';
import { useToast } from '../../hooks/useToast';
import { FileText, Plus } from 'lucide-react';

export default function Policies() {
  const { data: policies, loading, error, createItem, updateItem, deleteItem } = usePolicies();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0
  });

  const columns = [
    {
      key: 'title',
      title: 'Title',
      render: (value) => <span className="font-medium">{value}</span>
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

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title || '',
      description: policy.description || '',
      order: policy.order || policies.length
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (policy) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await deleteItem(policy.id);
        addToast('Policy deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting policy: ' + error.message, 'error');
      }
    }
  };

  const handleAddNew = () => {
    setEditingPolicy(null);
    setFormData({
      title: '',
      description: '',
      order: policies.length + 1
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title) {
      addToast('Please enter a title', 'error');
      return;
    }
    
    try {
      if (editingPolicy) {
        await updateItem(editingPolicy.id, formData);
        addToast('Policy updated successfully!', 'success');
      } else {
        await createItem(formData);
        addToast('Policy created successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving policy: ' + error.message, 'error');
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
        Error loading policies: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policies</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your venue policies
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <FileText className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={policies}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? "Edit Policy" : "Add New Policy"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter policy title"
            required
          />

          <FormField
            label="Description"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter policy description"
            textarea
            rows={6}
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
          />

          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full">
              {editingPolicy ? 'Update Policy' : 'Add Policy'}
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