import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FormField } from '../../components/forms/FormField';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { Phone, Mail, MapPin, MessageCircle, Instagram } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Spinner } from '../../components/ui/spinner';

export default function ContactInfo() {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    instagram: '',
    mapEmbedUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setDataLoading(true);
        const docRef = doc(db, 'contactInfo', 'info');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        addToast('Error fetching contact data: ' + error.message, 'error');
      } finally {
        setDataLoading(false);
      }
    };

    fetchContactData();
  }, [addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const docRef = doc(db, 'contactInfo', 'info');
      await setDoc(docRef, formData, { merge: true });
      addToast('Contact information updated successfully!', 'success');
    } catch (error) {
      addToast('Error updating contact information: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading && !formData.address) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your venue contact information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <FormField
                label="Address"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter venue address"
                required
              />

              <FormField
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />

              <FormField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />

              <FormField
                label="WhatsApp Number"
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Enter WhatsApp number"
              />

              <FormField
                label="Instagram Handle"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="Enter Instagram handle"
              />

              <FormField
                label="Google Maps Embed URL"
                id="mapEmbedUrl"
                name="mapEmbedUrl"
                value={formData.mapEmbedUrl}
                onChange={handleChange}
                placeholder="Enter Google Maps embed URL"
                textarea
                rows={3}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formData.address || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formData.phone || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formData.email || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MessageCircle className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formData.whatsapp || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Instagram className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Instagram</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formData.instagram || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.mapEmbedUrl && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Map</h3>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Map preview would appear here</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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