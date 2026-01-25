import React from "react";

/**
 * Component hiển thị danh sách comment
 * @param {Object} props
 * @param {Array} props.comments - Danh sách comment
 * @param {boolean} props.isLoading - Đang loading
 * @param {React.ReactNode} props.children - CommentItem components
 */
const CommentList = ({ comments, isLoading, children }) => {
  // Loading skeleton
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-100 rounded"></div>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <i className="fas fa-comments text-2xl text-gray-400"></i>
        </div>
        <h4 className="text-md text-gray-700 font-medium mb-1">Chưa có bình luận nào</h4>
        <p className="text-md text-gray-500">Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return <div className="space-y-6">{children}</div>;
};

export default CommentList;
