import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ViewBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [reply, setReply] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch blog post and comments
  const fetchBlogPostAndComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog-posts/view-single-blog?id=${id}`);
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

  // Navigate to template details page
  const handleTemplateClick = (templateId: number) => {
    router.push(`/frontend/blog-posts/blog-link-template?id=${templateId}`);
  };

  // Add a new comment
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
          blogPostId: Number(id),
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

  // Add a reply to a comment
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
          blogPostId: Number(id),
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

  // Handle ratings (upvote/downvote)
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
            <div className="w-full">
              <p className="font-medium text-gray-800">{comment.content}</p>
              <p className="text-sm text-gray-500">
                Posted by {comment.user?.firstName} {comment.user?.lastName}
              </p>
              <div className="flex items-center space-x-2 mt-2">
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
                className="mt-2 text-sm text-blue-500 underline"
              >
                Reply
              </button>
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
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        {post ? (
          <>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-600 mt-2">{post.description}</p>
            <div className="text-gray-800 mt-4">{post.content}</div>
            <div className="mt-4 text-sm text-gray-500">
              Posted by {post.user?.firstName} {post.user?.lastName}
            </div>
            <div className="flex mt-4 space-x-4">
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
            {post.templates?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Templates</h2>
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
            <h2 className="text-2xl font-bold mt-6">Comments</h2>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Comment
            </button>
            <div className="mt-6 space-y-6">{renderComments(comments)}</div>
          </>
        ) : (
          <p className="text-gray-500">Blog post not found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewBlogPost;
