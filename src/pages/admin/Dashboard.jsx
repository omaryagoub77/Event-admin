import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Users, Calendar, Image, Package, Building } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    facilities: 0,
    gallery: 0,
    packages: 0,
    bookings: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const facilitiesCount = await getCountFromServer(collection(db, 'facilities'));
        const galleryCount = await getCountFromServer(collection(db, 'gallery'));
        const packagesCount = await getCountFromServer(collection(db, 'packages'));
        const bookingsCount = await getCountFromServer(collection(db, 'bookings'));

        setStats({
          facilities: facilitiesCount.data().count,
          gallery: galleryCount.data().count,
          packages: packagesCount.data().count,
          bookings: bookingsCount.data().count
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const statCards = [
    { title: 'Facilities', value: stats.facilities, icon: <Building className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Gallery Items', value: stats.gallery, icon: <Image className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Packages', value: stats.packages, icon: <Package className="h-6 w-6" />, color: 'bg-purple-500' },
    { title: 'Bookings', value: stats.bookings, icon: <Calendar className="h-6 w-6" />, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome to your event venue admin dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon.type;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 text-muted-foreground ${stat.color.replace('bg-', 'text-')}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No recent bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Image className="h-8 w-8 text-blue-500" />
                <span className="mt-2 text-sm font-medium">Add Gallery Item</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Package className="h-8 w-8 text-green-500" />
                <span className="mt-2 text-sm font-medium">Add Package</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Building className="h-8 w-8 text-purple-500" />
                <span className="mt-2 text-sm font-medium">Add Facility</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <Users className="h-8 w-8 text-yellow-500" />
                <span className="mt-2 text-sm font-medium">View Bookings</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}