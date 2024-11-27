// export default ViewBlogPost;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Fetch blog post and comments
  const fetchBlogPostAndComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog-posts/view-single-blog?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the blog post.');
      }
      const data = await response.json();
      setPost(data.post);
      setComments(data.post.comments || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the blog post.');
    } finally {
      setLoading(false);
    }
  };

  // Check if the user is an admin
  const checkAdminStatus = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decodedToken.role === 'admin');
      } catch (error) {
        console.error('Failed to decode token', error);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogPostAndComments();
    }
    checkAdminStatus();
  }, [id]);

  // Handle adding comments
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
        body: JSON.stringify({ content: newComment, blogPostId: Number(id) }),
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
        body: JSON.stringify({ isUpvote, blogPostId, commentId }),
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

  // Handle reports for comments or blog posts
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

  // Handle hiding comments or blog posts (admin only)
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

  // Handle unhiding comments or blog posts (admin only)
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

  const renderComments = (commentList: any[]) => {
    return commentList.map((comment) => (
      <div key={comment.id} className="border rounded-lg p-4 ml-4">
        <p className={`font-medium ${comment.isHidden ? 'text-gray-400' : 'text-gray-800'}`}>
          {comment.isHidden ? 'This comment is hidden.' : comment.content}
        </p>
        <div className="flex space-x-4 mt-2">
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
            <h1 className={`text-3xl font-bold ${post.isHidden ? 'text-gray-400' : ''}`}>
              {post.isHidden ? 'This post is hidden.' : post.title}
            </h1>
            <p className="text-gray-600 mt-2">{post.description}</p>
            <div className="mt-4 flex space-x-4">
              {!post.isHidden && (
                <>
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
                    onClick={() => handleReports(undefined, Number(id))}
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
                      onClick={() => handleUnhiding(undefined, Number(id))}
                      className="text-green-500 hover:text-green-600"
                    >
                      Unhide Post
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHiding(undefined, Number(id))}
                      className="text-gray-500 hover:text-black"
                    >
                      Hide Post
                    </button>
                  )}
                </>
              )}
            </div>
            <h2 className="text-xl font-bold mt-6">Comments</h2>
            {renderComments(comments)}
          </>
        ) : (
          <p>Blog post not found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewBlogPost;
