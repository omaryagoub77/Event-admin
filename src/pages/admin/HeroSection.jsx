import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Spinner } from '../../components/ui/spinner';

export default function HeroSection() {
  const [formData, setFormData] = useState({
    heroHeadline: '',
    heroSubtext: '',
    heroBackgroundUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'settings', 'hero');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        addToast('Error fetching hero data: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, [addToast]);

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
      const fileRef = ref(storage, `hero/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      setFormData(prev => ({
        ...prev,
        heroBackgroundUrl: url
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
      setLoading(true);
      const docRef = doc(db, 'settings', 'hero');
      await setDoc(docRef, formData, { merge: true });
      addToast('Hero section updated successfully!', 'success');
    } catch (error) {
      addToast('Error updating hero section: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.heroHeadline) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Section</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage the hero section content for your website
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Hero Content</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <FormField
              label="Hero Headline"
              id="heroHeadline"
              name="heroHeadline"
              value={formData.heroHeadline}
              onChange={handleChange}
              placeholder="Enter hero headline"
              required
            />

            <FormField
              label="Hero Subtext"
              id="heroSubtext"
              name="heroSubtext"
              value={formData.heroSubtext}
              onChange={handleChange}
              placeholder="Enter hero subtext"
              textarea
              rows={4}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Image
              </label>
              {formData.heroBackgroundUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.heroBackgroundUrl} 
                    alt="Hero background" 
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
                  <div className="flex items-center mt-2">
                    <Spinner size="sm" className="mr-2" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || imageUploading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="relative rounded-xl overflow-hidden h-96 flex items-center justify-center"
            style={{
              backgroundImage: `url(${formData.heroBackgroundUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {formData.heroHeadline || 'Your Event Venue'}
              </h1>
              <p className="text-xl text-white max-w-2xl mx-auto">
                {formData.heroSubtext || 'Create unforgettable memories at our stunning event venue'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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