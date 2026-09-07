export const Loader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-700 text-lg font-medium">Загрузка</p>
        <p className="text-gray-400 text-sm mt-1">Пожалуйста, подождите</p>
      </div>
    </div>
  );
};
