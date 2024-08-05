import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Product = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    rating: 0,
    likes: 0,
    photos: [],
    video: null
  });
  const [error, setError] = useState(''); // Define error state

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/product');
      const items = response.data;
      setItems(items);
    } catch (error) {
      console.error('Error fetching product items:', error);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('rating', form.rating);
    formData.append('likes', form.likes);

    for (let i = 0; i < form.photos.length; i++) {
      formData.append('photos', form.photos[i]);
    }

    if (form.video) {
      formData.append('video', form.video[0]);
    }

    try {
      await axios.post('http://localhost:3000/api/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchItems(); // Refresh the list
      setError(''); // Clear error after successful submission
    } catch (error) {
      console.error('Error adding product item:', error);
      setError('Failed to add product item. Please check the console for more details.');
    }
  };

  return (
    <div>
      <h1>Product Page</h1>

      {/* Form to add new items */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleInputChange} required />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleInputChange} required />
        <input type="number" name="rating" placeholder="Rating" value={form.rating} min="0" max="5" onChange={handleInputChange} required />
        <input type="number" name="likes" placeholder="Likes" value={form.likes} onChange={handleInputChange} required />
        <input type="file" name="photos" multiple accept="image/jpeg, image/png" onChange={handleFileChange} />
        <input type="file" name="video" accept="video/mp4" onChange={handleFileChange} />
        <button type="submit">Add Item</button>
      </form>

      {/* Display error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display the items in a table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Date Created</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Likes</th>
            <th>Photos</th>
            <th>Video</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{new Date(item.date_created).toLocaleString()}</td>
              <td>${item.price}</td>
              <td>{item.rating}</td>
              <td>{item.likes}</td>
              <td>
                {item.photos.length > 0
                  ? item.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={`http://localhost:3000/uploads/${photo}`}
                    alt={`Product ${item.name}`}
                    width="50"
                    />
                  ))
                : 'No photos'}
              </td>
              <td>
                {item.video ? <video width="100" controls src={`http://localhost:3000/uploads/${item.video}`} /> : 'No video'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Product;
