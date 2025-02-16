import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      // Sort posts so the latest appear at the top.
      const sortedPosts = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first!');
        return;
      }
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh posts to update like count.
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Error liking post!');
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Post URL copied to clipboard!'))
      .catch((err) => {
        console.error('Error copying URL:', err);
        alert('Unable to copy URL.');
      });
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h2 className="mb-4">Feed</h2>
          <div
            className="overflow-auto custom-scrollbar"
            style={{ maxHeight: '70vh', paddingRight: '1rem' }}
          >
            {posts.map((post) => (
              <div key={post._id} className="card mb-3">
                <div className="card-body">
                  {/* User Info and Timestamp */}
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">
                      {post.userId?.username || 'Unknown User'}
                    </span>
                    <small className="text-muted">
                      {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {/* Clickable Title */}
                  <h5 className="mt-2">
                    <a href={`/post/${post._id}`} className="text-decoration-none">
                      {post.title || 'Untitled Post'}
                    </a>
                  </h5>
                  {/* Post Body */}
                  <p className="card-text">{post.content}</p>
                  {/* Media (Image/Video) */}
                  {post.mediaUrl && (
                    isVideo(post.mediaUrl) ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post Media"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                      />
                    )
                  )}
                  {/* Like and Share Buttons */}
                  <div className="d-flex justify-content-around mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleLike(post._id)}
                    >
                      👍 {post.likes || 0}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleShare(post._id)}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-muted">No posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
