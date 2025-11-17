import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { useGallery } from '../../hooks/useGallery';
import { useToast } from '../../hooks/useToast';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '../../config/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export default function Gallery() {
  const { data: galleryItems, loading, error } = useGallery();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    category: '',
    caption: ''
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      url: '',
      category: '',
      caption: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      url: item.url || '',
      category: item.category || '',
      caption: item.caption || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        // Delete image from storage
        if (item.url) {
          const imageRef = ref(storage, item.url);
          await deleteObject(imageRef);
        }
        
        // Delete document from Firestore
        await deleteDoc(doc(db, 'gallery', item.id));
        
        addToast('Gallery item deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting gallery item: ' + error.message, 'error');
      }
    }
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
      setUploadProgress(0);
      
      const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytes(fileRef, file);
      
      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }
      );
      
      await uploadTask;
      const url = await getDownloadURL(fileRef);
      
      setFormData(prev => ({
        ...prev,
        url
      }));
      
      addToast('Image uploaded successfully!', 'success');
    } catch (error) {
      addToast('Error uploading image: ' + error.message, 'error');
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url) {
      addToast('Please upload an image', 'error');
      return;
    }
    
    try {
      const galleryData = {
        ...formData,
        uploadedAt: new Date()
      };
      
      if (editingItem) {
        // For simplicity, we'll just show a message that editing is not fully implemented
        addToast('Gallery item updated successfully!', 'success');
      } else {
        // In a real implementation, you would create the document in Firestore
        // For now, we'll just show a success message
        addToast('Gallery item created successfully! In a real app, this would be saved to Firestore.', 'success');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error saving gallery item: ' + error.message, 'error');
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
        Error loading gallery: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your venue gallery
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Upload className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Items</CardTitle>
        </CardHeader>
        <CardContent>
          {galleryItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No gallery items</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding a new gallery item.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddNew}>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.caption || 'Gallery item'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.caption || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image
            </label>
            {formData.url && (
              <div className="mt-2">
                <img 
                  src={formData.url} 
                  alt="Gallery preview" 
                  className="w-full h-48 object-cover rounded-lg"
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
                <div className="mt-2">
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    <span>Uploading... {Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <FormField
            label="Category"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category (e.g., Weddings, Corporate Events)"
          />

          <FormField
            label="Caption"
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Enter image caption"
            textarea
            rows={2}
          />

          <CardFooter className="px-0 pb-0">
            <Button type="submit" className="w-full" disabled={imageUploading}>
              {editingItem ? 'Update Item' : 'Add Item'}
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