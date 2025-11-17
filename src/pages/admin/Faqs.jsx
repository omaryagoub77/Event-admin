import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { useFaqs } from '../../hooks/useFaqs';
import { useToast } from '../../hooks/useToast';
import { HelpCircle, Plus } from 'lucide-react';

export default function Faqs() {
  const { data: faqs, loading, error, createItem, updateItem, deleteItem } = useFaqs();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0
  });

  const columns = [
    {
      key: 'question',
      title: 'Question',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'answer',
      title: 'Answer',
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

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      order: faq.order || faqs.length
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (faq) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteItem(faq.id);
        addToast('FAQ deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting FAQ: ' + error.message, 'error');
      }
    }
  };

  const handleAddNew = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      order: faqs.length + 1
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
    if (!formData.question || !formData.answer) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      if (editingFaq) {
        await updateItem(editingFaq.id, formData);
        addToast('FAQ updated successfully!', 'success');
      } else {
        await createItem(formData);
        addToast('FAQ created successfully!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving FAQ: ' + error.message, 'error');
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
        Error loading FAQs: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQs</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={faqs}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Question"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Enter question"
            required
          />

          <FormField
            label="Answer"
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Enter answer"
            textarea
            rows={4}
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
              {editingFaq ? 'Update FAQ' : 'Add FAQ'}
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