const CategoryTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={() => onTabChange('Tech')}
        className={`px-6 py-2 rounded-full font-semibold transition-colors shadow-sm ${
          activeTab === 'Tech'
            ? 'bg-gray-200 text-gray-900 border border-gray-300'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        Tech
      </button>
      <button
        onClick={() => onTabChange('Management')}
        className={`px-6 py-2 rounded-full font-semibold transition-colors shadow-sm ${
          activeTab === 'Management'
            ? 'bg-white text-gray-900 border border-gray-300 shadow'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        Management
      </button>
    </div>
  );
};

export default CategoryTabs;

