const DifficultyCard = ({ difficulty, selected, onClick }) => {
  const getBarsColor = (level) => {
    if (level <= 2) return 'bg-green-500';
    if (level === 3) return 'bg-yellow-500';
    if (level === 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getInactiveBarsColor = (level) => {
    if (level <= 2) return 'bg-green-200';
    if (level === 3) return 'bg-yellow-200';
    if (level === 4) return 'bg-orange-200';
    return 'bg-red-200';
  };

  const color = getBarsColor(difficulty.level);
  const inactiveColor = getInactiveBarsColor(difficulty.level);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-end gap-1 h-12">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-8 rounded-t ${
                bar <= difficulty.level ? color : inactiveColor
              }`}
              style={{ height: `${(bar * 12) + 12}px` }}
            />
          ))}
        </div>
      </div>
      <p className="text-center font-semibold text-gray-800">{difficulty.name}</p>
    </div>
  );
};

export default DifficultyCard;

