import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import { Camera, Upload, SunMoon } from 'lucide-react';

const App = () => {
  const [identifiedAnimal, setIdentifiedAnimal] = useState('');
  const [animalInfo, setAnimalInfo] = useState(null);
  const [scientificClassification, setScientificClassification] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [img_url,setImage] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
  
      // Fetch the raw response and parse manually
      axios.post('http://localhost:5000/api/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformResponse: [data => data], // Keep raw response as string
      }).then(response => {
        // Parse response to preserve key order
        const orderedData = JSON.parse(response.data, (key, value) => value);
  
        // Now use this orderedData
        setIdentifiedAnimal(orderedData.label);
        setImage(orderedData.imgurl);
        fetchAnimalInfo(orderedData);
      }).catch(error => {
        alert(error);
      });
    }
  };      

  const fetchAnimalInfo = async (resp) => {
    try {
      setAnimalInfo(resp.summary);
      setScientificClassification(resp.taxonomy);
    } catch (error) {
      console.error('Error fetching animal info:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const themeStyles = {
    backgroundColor: isDarkMode ? '#000' : '#f2f2f7',
    color: isDarkMode ? '#fff' : '#000',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

  return (
    <div style={{
      ...themeStyles,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        borderBottom: isDarkMode ? '1px solid #333' : '1px solid #ddd'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          cursor: 'pointer',
          color: isDarkMode ? '#007aff' : '#007aff',
        }} onClick={() => setAnimalInfo(null)}>
          FaunaFinder
        </h1>

        {/* Button Container for Recalculate and Dark Mode Toggle */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            style={{
              backgroundColor: isDarkMode ? '#aaa' : '#696969',
              color: isDarkMode ? '#000' : '#fff',
              padding: isMobile ? '7px 13px' : '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
            {isDarkMode ? <SunMoon /> : <SunMoon />}
          </button>
        </div>
      </header>

      {/* Home/Upload Section */}
      {!animalInfo ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100%',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: isDarkMode ? '#fff' : '#000',
          }}>
            Discover the World's Fauna
          </h2>
          <p style={{
            fontSize: '1rem',
            color: isDarkMode ? '#ccc' : '#6e6e73',
            marginBottom: '30px',
            maxWidth: '600px',
          }}>
            FaunaFinder helps you identify animals from around the world using the power of image recognition technology.
            Simply upload an image or take a picture to get started.
          </p>

          {/* Upload Button */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <label htmlFor="upload-image" style={{
              backgroundColor: '#007aff',
              color: '#fff',
              padding: '15px 30px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease',
            }}>
              {isMobile ? (
                <div style ={{ display: 'flex' }}>
                  <Camera style={{ marginRight: '10px' }} /> Capture Image
                </div>
              ) : (
                <div style ={{ display: 'flex' }}>
                  <Upload style={{ marginRight: '10px' }} /> Upload Image
                </div>
              )}
              <input
                id="upload-image"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '40px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '20px',
          width: '100%',
          maxWidth: '1200px',
        }}>
          {/* Animal Image */}
          <div style={{ flex: '1', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={animalInfo.thumbnail?.source || img_url}
                alt={identifiedAnimal}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              {/* Animal Name inside Image */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                padding: '10px 15px',
                borderRadius: '8px',
                color: isDarkMode ? '#fff' : '#000',
                fontSize: isDesktop ? '2.5rem' : '1.5rem',
                fontWeight: 'bold',
              }}>
                {identifiedAnimal}
              </div>
            </div>
          </div>

          {/* Animal Info Section */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Overview Section */}
            <div style={{
              backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
              color: isDarkMode ? '#fff' : '#000',
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', marginTop: '0' }}>Overview</h3>
              <p style={{ marginBottom: '0' }}>{animalInfo}</p>
            </div>

            {/* Scientific Classification Section */}
            <div style={{
              backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
              color: isDarkMode ? '#fff' : '#000',
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', marginTop: '0' }}>Scientific Classification</h3>
              {scientificClassification && Object.keys(scientificClassification).length > 0 ? (
                <ul style={{ lineHeight: '2rem', marginBottom: '0' }}>
                  {Object.entries(scientificClassification).map(([key, value]) => (
                    <li key={Object.entries(value)[0][0]}><strong>{Object.entries(value)[0][0]}:</strong> {Object.entries(value)[0][1]}</li>
                  ))}
                </ul>
              ) : (
                <p>Scientific classification information not available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;