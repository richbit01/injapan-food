
import AdminLayout from '@/components/admin/AdminLayout';
import OrderConfirmation from '@/components/admin/OrderConfirmation';

const OrderConfirmationPage = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <OrderConfirmation />
      </div>
    </AdminLayout>
  );
};

export default OrderConfirmationPage;
