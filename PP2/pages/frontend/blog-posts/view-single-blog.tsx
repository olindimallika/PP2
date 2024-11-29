import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ViewBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const blogId = Array.isArray(id) ? id[0] : id;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [reply, setReply] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalComments, setTotalComments] = useState<number>(0);

  // Fetch blog post and comments with pagination
  const fetchBlogPostAndComments = async (page: number = 1) => {
    if (!blogId) {
      setError('No blog post ID provided');
      return;
    }

    try {
      console.log('Fetching blog post with ID:', blogId, 'Page:', page);
      const response = await fetch(`/api/blog-posts/view-single-blog?id=${blogId}&page=${page}&limit=5`);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || 'Failed to fetch the blog post.');
      }

      if (!data.post) {
        throw new Error('Blog post data is missing from the response');
      }

      setPost(data.post);
      setComments(data.post.comments || []);
      setTotalComments(data.totalComments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setError('');
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(err.message || 'An error occurred while fetching the blog post.');
    }
  };

  // Check if the user is an admin
  const checkAdminStatus = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          console.error('User is not an admin.');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        setIsAdmin(false);
      }
    } else {
      console.error('No token found.');
      setIsAdmin(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to post a comment.');
      return;
    }

    try {
      const response = await fetch('/api/blog-posts/create-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          blogPostId: Number(blogId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment.');
      }

      const newCommentData = await response.json();
      setComments((prevComments) => [newCommentData.comment, ...prevComments]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the comment.');
    }
  };

  // Handle ratings
  const handleRating = async (isUpvote: boolean, blogPostId?: number, commentId?: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to rate.');
      return;
    }

    try {
      const response = await fetch('/api/blog-posts/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isUpvote,
          blogPostId,
          commentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update rating.');
      }

      const ratingData = await response.json();
      if (blogPostId) {
        setPost((prevPost: any) => ({
          ...prevPost,
          upvoteCount: ratingData.upvotes,
          downvoteCount: ratingData.downvotes,
        }));
      } else if (commentId) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  upvoteCount: ratingData.upvotes,
                  downvoteCount: ratingData.downvotes,
                }
              : comment
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the rating.');
    }
  };

  // Handle reports
  const handleReports = async (commentId?: number, blogPostId?: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to report.');
      return;
    }
    const reason = prompt('Please provide a reason for reporting this content:');
    if (!reason || reason.trim() === '') {
      setError('Reason for reporting is required.');
      return;
    }
    try {
      const response = await fetch('/api/icr/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, blogPostId, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit the report.');
      }
      const data = await response.json();
      alert(data.message || 'Report submitted successfully.');
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the report.');
    }
  };

  // Handle hiding content
  const handleHiding = async (commentId?: number, blogPostId?: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !isAdmin) {
      setError('You must be an admin to hide content.');
      return;
    }
    try {
      const response = await fetch('/api/icr/hide-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, blogPostId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to hide content.');
      }
      alert('Content hidden successfully!');
      fetchBlogPostAndComments();
    } catch (err: any) {
      setError(err.message || 'An error occurred while hiding the content.');
    }
  };

  // Handle unhiding content
  const handleUnhiding = async (commentId?: number, blogPostId?: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !isAdmin) {
      setError('You must be an admin to unhide content.');
      return;
    }
    try {
      const response = await fetch('/api/icr/unhide', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, blogPostId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unhide content.');
      }
      alert('Content unhidden successfully!');
      fetchBlogPostAndComments();
    } catch (err: any) {
      setError(err.message || 'An error occurred while unhiding the content.');
    }
  };

  // Handle adding a reply
  const handleAddReply = async (parentId: number) => {
    if (!reply[parentId]?.trim()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to post a reply.');
      return;
    }

    try {
      const response = await fetch('/api/blog-posts/create-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: reply[parentId],
          blogPostId: Number(blogId),
          parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add reply.');
      }

      const newReplyData = await response.json();
      setComments((prevComments) => [newReplyData.comment, ...prevComments]);
      setReplyingTo(null);
      setReply((prev) => ({ ...prev, [parentId]: '' }));
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the reply.');
    }
  };

  // Render comments
  const renderComments = (commentList: any[], parentId: number | null = null) => {
    return commentList
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => (
        <div
          key={comment.id}
          className={`p-4 ${
            parentId ? 'ml-6 border-l-2 border-gray-200' : 'ml-4 border rounded-lg'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={comment.user?.avatar || '/default-avatar.png'}
                alt={`${comment.user?.firstName || 'User'}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="w-full">
              <p className={`font-medium ${comment.isHidden ? 'text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                {comment.isHidden ? 'This comment is hidden.' : comment.content}
              </p>
              <p className="text-sm text-gray-500 dark:text-white text-black">
                Posted by {comment.user?.firstName} {comment.user?.lastName}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {!comment.isHidden && (
                  <>
                    <button
                      onClick={() => handleRating(true, undefined, comment.id)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      ▲ {comment.upvoteCount}
                    </button>
                    <button
                      onClick={() => handleRating(false, undefined, comment.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ▼ {comment.downvoteCount}
                    </button>
                    <button
                      onClick={() => handleReports(comment.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-2 text-sm text-blue-500 underline dark:text-white text-black"
                    >
                      Reply
                    </button>
                  </>
                )}
                {isAdmin && (
                  <>
                    {comment.isHidden ? (
                      <button
                        onClick={() => handleUnhiding(comment.id)}
                        className="text-green-500 hover:text-green-600"
                      >
                        Unhide
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHiding(comment.id)}
                        className="text-gray-500 hover:text-black"
                      >
                        Hide
                      </button>
                    )}
                  </>
                )}
              </div>
              {replyingTo === comment.id && (
                <div className="mt-4 dark:text-white text-black">
                  <textarea
                    placeholder="Write a reply..."
                    value={reply[comment.id] || ''}
                    onChange={(e) =>
                      setReply((prev) => ({ ...prev, [comment.id]: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white text-black"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-blue-500 text-black px-4 dark:text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              )}
              <div className="mt-4">{renderComments(commentList, comment.id)}</div>
            </div>
          </div>
        </div>
      ));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBlogPostAndComments(newPage);
  };

  useEffect(() => {
    if (blogId) {
      console.log('Blog ID from query:', blogId);
      fetchBlogPostAndComments(currentPage);
    }
    checkAdminStatus();
  }, [blogId, currentPage]);

  // Handle template click
const handleTemplateClick = (templateId: number) => {
    router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-800 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl dark:bg-zinc-900">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {post ? (
          <>
            <h1 className={`text-3xl font-bold ${post.isHidden ? 'text-gray-400': 'text-black dark:text-white' }`}>
              {post.isHidden ? 'This post is hidden.' : post.title }
            </h1>
            <p className="text-gray-600 mt-2 dark:text-white">{post.description}</p>
            <div className="text-gray-800 mt-4 dark:text-white">{post.content}</div>
            <div className="mt-4 text-sm text-gray-500 dark:text-white">
              Posted by {post.user?.firstName} {post.user?.lastName}
            </div>
            <div className="mt-4 flex space-x-4">
              {!post.isHidden && (
                <>
                  <button
                    onClick={() => handleRating(true, Number(blogId))}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    ▲ {post.upvoteCount}
                  </button>
                  <button
                    onClick={() => handleRating(false, Number(blogId))}
                    className="text-red-500 hover:text-red-600"
                  >
                    ▼ {post.downvoteCount}
                  </button>
                  <button
                    onClick={() => handleReports(undefined, Number(blogId))}
                    className="text-red-500 hover:text-red-600"
                  >
                    Report Post
                  </button>
                </>
              )}
              {isAdmin && (
                <>
                  {post.isHidden ? (
                    <button
                      onClick={() => handleUnhiding(undefined, Number(blogId))}
                      className="text-green-500 hover:text-green-600"
                    >
                      Unhide Post
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHiding(undefined, Number(blogId))}
                      className="text-gray-500 hover:text-black"
                    >
                      Hide Post
                    </button>
                  )}
                </>
              )}
            </div>
            {post.templates?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">Templates</h2>
                <ul className="list-disc pl-5">
                  {post.templates.map((template: any) => (
                    <li key={template.id}>
                      <button
                        onClick={() => handleTemplateClick(template.id)}
                        className="text-blue-500 underline"
                      >
                        {template.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <h2 className="text-2xl font-bold mt-6 text-black dark:text-white">Comments</h2>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-700 dark:text-white text-black"
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Comment
            </button>
            <div className="mt-6 space-y-6">{renderComments(comments)}</div>
            
            {/* Pagination controls */}
            <div className="flex justify-center mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2"
              >
                Previous
              </button>
              <span className=" text-gray-700 dark:text-white rounded-lg mr-2">
                Page {currentPage} of {totalPages}
                
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg ml-2"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Blog post not found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewBlogPost;
