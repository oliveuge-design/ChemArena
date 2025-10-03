import { memo } from "react"

const CategorySelector = memo(function CategorySelector({
  categories,
  onCategorySelect,
  getCategoryIcon,
  safeQuizCount
}) {
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Caricamento categorie...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-6">
        {categories
          .filter(category => category && typeof category === 'string')
          .map((category, index) => {
            const categoryKey = `category-${category}-${index}`
            return (
              <button
                key={categoryKey}
                onClick={() => onCategorySelect(category)}
                className="group p-6 bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-blue-200"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(category)}
                </div>
                <div className="font-semibold text-gray-900 text-lg mb-1">{String(category)}</div>
                <div className="text-sm text-gray-500">
                  {safeQuizCount(category)} quiz
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
})

export default CategorySelector