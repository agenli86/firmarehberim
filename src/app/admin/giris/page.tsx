import AdminGirisForm from './AdminGirisForm';

export const metadata = { title: 'Admin Giriş', robots: { index: false } };

export default function AdminGirisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-4">N</div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900">Admin Paneli</h1>
          <p className="text-sm text-gray-500 mt-1">Sadece yetkili kullanıcılar</p>
        </div>
        <AdminGirisForm />
      </div>
    </div>
  );
}
