import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ViewBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Extract blog post ID from query params

  const [post, setPost] = useState<any>(null); // State to store the blog post details
  const [comments, setComments] = useState<any[]>([]); // State to store comments
  const [newComment, setNewComment] = useState<string>(''); // State for new comment input
  const [reply, setReply] = useState<{ [key: number]: string }>({}); // State for replies keyed by comment ID
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // Track which comment is being replied to
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string>(''); // Error messages
  const [report, setReport] = useState<string>(''); // Report message
  // Fetch blog post and comments
  const fetchBlogPostAndComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog-posts/view-single-blog?id=${id}`); // Backend API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch the blog post.');
      }

      const data = await response.json();
      setPost(data.post); // Set the blog post data
      setComments(data.post.comments || []); // Ensure comments are loaded from the API
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the blog post.');
    } finally {
      setLoading(false);
    }
  };

  // Handle ratings (upvote/downvote)
  const handleRating = async (isUpvote: boolean, blogPostId?: number, commentId?: number) => {
    const token = localStorage.getItem('accessToken'); // Retrieve user's token
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
        // Update the blog post rating counts
        setPost((prevPost: any) => ({
          ...prevPost,
          upvoteCount: ratingData.upvotes,
          downvoteCount: ratingData.downvotes,
        }));
      } else if (commentId) {
        // Update the specific comment rating counts
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

  const handleReports = async (commentId?: number, blogPostId?: number) => {
    const token = localStorage.getItem('accessToken'); // Retrieve the user's token
    if (!token) {
      setError('You must be logged in to report.');
      return;
    }
  
    const reason = prompt("Please provide a reason for reporting this content:"); // Ask user for reason
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
        body: JSON.stringify({
          commentId,
          blogPostId,
          reason,
        }),
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
  

  useEffect(() => {
    if (id) {
      fetchBlogPostAndComments();
    }
  }, [id]);

  // Recursive function to render nested comments
  const renderComments = (commentList: any[], parentId: number | null = null) => {
    return commentList
      .filter((comment) => comment.parentId === parentId)
      .map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4 ml-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={comment.user?.avatar || '/default-avatar.png'}
                alt={`${comment.user?.firstName || 'User'}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div>
              <p className="text-gray-800">{comment.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted by {comment.user?.firstName} {comment.user?.lastName}
              </p>
              <div className="flex items-center mt-2 space-x-2">
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
              </div>
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-blue-500 text-sm underline mt-2"
              >
                Reply
              </button>
              <button 
                onClick={() => handleReports(comment.id, undefined)} // Pass commendId
                className="text-red-500 text-sm underline mt-2"
              >
                Report Comment
              </button>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-4">
                  <textarea
                    placeholder="Write a reply..."
                    value={reply[comment.id] || ''}
                    onChange={(e) =>
                      setReply((prev) => ({ ...prev, [comment.id]: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-4 mt-2">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 text-gray-500 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRating(true, undefined, comment.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              )}

              {/* Render Replies */}
              <div className="ml-6 mt-4">
                {renderComments(commentList, comment.id)}
              </div>
            </div>
          </div>
        </div>
      ));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        {post ? (
          <>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-600 mb-6">{post.description}</p>
            <div className="text-gray-800 mb-6">
              <p>{post.content}</p>
            </div>
            <div className="flex items-center mt-4 space-x-4">
              <button
                onClick={() => handleRating(true, Number(id))}
                className="text-blue-500 hover:text-blue-600"
              >
                ▲ {post.upvoteCount}
              </button>
              <button
                onClick={() => handleRating(false, Number(id))}
                className="text-red-500 hover:text-red-600"
              >
                ▼ {post.downvoteCount}
              </button>
              <button
                onClick={() => handleReports(undefined, Number(id))} // Pass blogPostId
                className="text-red-500 text-sm underline mt-2"
              >
              Report Post
              </button>
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-4">Comments ({comments.length})</h2>
            <div className="space-y-6">{renderComments(comments)}</div>
          </>
        ) : (
          <p className="text-gray-600">Blog post not found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewBlogPost;
