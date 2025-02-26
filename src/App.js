// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch all posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    fetch('http://localhost:5000/api/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    if (!form.title || !form.content) {
      alert('Title and content are required.');
      return;
    }
    if (editingId) {
      // Update existing post
      fetch(`http://localhost:5000/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then((res) => res.json())
        .then(() => {
          fetchPosts();
          setForm({ title: '', content: '' });
          setEditingId(null);
          setSelectedPost(null);
        })
        .catch((err) => console.error(err));
    } else {
      // Create new post
      fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then((res) => res.json())
        .then(() => {
          fetchPosts();
          setForm({ title: '', content: '' });
        })
        .catch((err) => console.error(err));
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content });
    console.log('Editing post:', post);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      fetch(`http://localhost:5000/api/posts/${id}`, { method: 'DELETE' })
        .then((res) => res.json())
        .then(() => {
          fetchPosts();
          if (selectedPost && selectedPost.id === id) {
            setSelectedPost(null);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const truncate = (text, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="container">
      <h1>Blog Platform</h1>
      <div className="main-content">
        <div className="post-list">
          <h2>Posts</h2>
          <ul>
            {posts.map((post) => (
              <li key={post.id} onClick={() => setSelectedPost(post)}>
                <h3>{post.title}</h3>
                <p>{truncate(post.content)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="post-detail">
          {selectedPost ? (
            <div>
              <h2>{selectedPost.title}</h2>
              <p>{selectedPost.content}</p>
              <button onClick={() => handleEdit(selectedPost)}>Edit</button>
              <button onClick={() => handleDelete(selectedPost.id)}>
                Delete
              </button>
              <button onClick={() => setSelectedPost(null)}>Close</button>
            </div>
          ) : (
            <div>
              <h2>{editingId ? 'Edit Post' : 'Add New Post'}</h2>
              <form onSubmit={handleSubmit}>
                <div>
                  <label>Title:</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Content:</label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                  ></textarea>
                </div>
                <button type="submit">
                  {editingId ? 'Update Post' : 'Create Post'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ title: '', content: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
