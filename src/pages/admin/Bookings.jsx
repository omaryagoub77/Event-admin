import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import DataTable from '../../components/data/DataTable';
import { Modal } from '../../components/ui/modal';
import { Toast } from '../../components/ui/toast';
import { Spinner } from '../../components/ui/spinner';
import { useBookings } from '../../hooks/useBookings';
import { useToast } from '../../hooks/useToast';
import { Calendar, User, Phone, Mail, Check, X, Eye, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Bookings() {
  const { data: bookings, loading, error, updateBooking, deleteBooking } = useBookings();
  const { toasts, addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'eventDate',
      title: 'Event Date',
      render: (value) => {
        if (!value) return 'N/A';
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch (e) {
          return 'Invalid Date';
        }
      }
    },
    {
      key: 'packageId',
      title: 'Package',
      render: (value) => <span className="text-sm">Package #{value ? value.slice(0, 6) : 'N/A'}</span>
    },
    {
      key: 'guests',
      title: 'Guests',
      render: (value) => <span className="text-sm">{value} guests</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      title: 'Booked On',
      render: (value) => {
        if (!value) return 'N/A';
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch (e) {
          return 'Invalid Date';
        }
      }
    }
  ];

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleApprove = async (bookingId) => {
    try {
      await updateBooking(bookingId, { status: 'approved' });
      addToast('Booking approved successfully!', 'success');
    } catch (error) {
      addToast('Error approving booking: ' + error.message, 'error');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await updateBooking(bookingId, { status: 'rejected' });
      addToast('Booking rejected successfully!', 'success');
    } catch (error) {
      addToast('Error rejecting booking: ' + error.message, 'error');
    }
  };

  const handleDelete = async (booking) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(booking.id);
        addToast('Booking deleted successfully!', 'success');
      } catch (error) {
        addToast('Error deleting booking: ' + error.message, 'error');
      }
    }
  };

  // Add action buttons to the table
  const actionColumns = [
    ...columns,
    {
      key: 'actions',
      title: 'Actions',
      render: (_, booking) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(booking)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApprove(booking.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(booking.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(booking)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

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
        Error loading bookings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage event bookings
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Booking Requests</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
                size="sm"
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredBookings}
            columns={actionColumns}
            onEdit={() => {}}
            onDelete={() => {}}
            actions={false}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Event Date</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedBooking.eventDate ? (() => {
                          try {
                            return format(new Date(selectedBooking.eventDate), 'MMMM dd, yyyy');
                          } catch (e) {
                            return 'Invalid Date';
                          }
                        })() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Package</p>
                      <p className="text-sm text-gray-900 dark:text-white">Package #{selectedBooking.packageId?.slice(0, 6) || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Guests</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.guests} guests</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
              <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {selectedBooking.notes || 'No additional notes provided.'}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleApprove(selectedBooking.id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedBooking.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedBooking)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
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