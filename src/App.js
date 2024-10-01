import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import { Camera, Upload, Loader2 } from 'lucide-react';

const App = () => {
  const [identifiedAnimal, setIdentifiedAnimal] = useState('');
  const [animalInfo, setAnimalInfo] = useState(null);
  const [scientificClassification, setScientificClassification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 768 });
  // const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // setImage(URL.createObjectURL(file));
      setIsLoading(true);
      setTimeout(() => {
        const animalName = prompt("Enter Animal name: ");
        setIdentifiedAnimal(animalName); // Placeholder for TensorFlow model
        fetchAnimalInfo(animalName);
      }, 1000);
    }
  };

  const handleCapture = () => {
    alert('Image capture functionality is not yet implemented.');
  };

  const fetchAnimalInfo = async (animal) => {
    try {
      setIsLoading(true);
      
      // Fetch Wikipedia summary
      const summary = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${animal}`);
      setAnimalInfo(summary.data);

      // Fetch Wikidata entity ID
      const wikidata = await axios.get(`https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${animal}&props=claims&format=json&origin=*`);
      const entityId = Object.keys(wikidata.data.entities)[0];

      // Fetch taxonomy data
      const taxonomyResponse = await axios.get(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P171&format=json&origin=*`);
      const taxonomyClaims = taxonomyResponse.data.claims.P171;

      const classificationLevels = [
        { name: 'Kingdom', property: 'P105', value: 'Q36732' },
        { name: 'Phylum', property: 'P105', value: 'Q37517' },
        { name: 'Class', property: 'P105', value: 'Q36460' },
        { name: 'Order', property: 'P105', value: 'Q36602' },
        { name: 'Family', property: 'P105', value: 'Q35409' },
        { name: 'Genus', property: 'P105', value: 'Q34740' },
        { name: 'Species', property: 'P105', value: 'Q7432' }
      ];

      const classification = {};

      for (const claim of taxonomyClaims) {
        const taxonId = claim.mainsnak.datavalue.value.id;
        const taxonData = await axios.get(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${taxonId}&props=labels|claims&languages=en&format=json&origin=*`);
        
        const taxonName = taxonData.data.entities[taxonId].labels.en.value;
        const taxonRankId = taxonData.data.entities[taxonId].claims.P105[0].mainsnak.datavalue.value.id;
        
        const level = classificationLevels.find(level => level.value === taxonRankId);
        if (level) {
          classification[level.name] = taxonName;
        }
      }

      // Add the species name (which is the animal we're looking up)
      classification['Species'] = animal;

      setScientificClassification(classification);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching animal info:', error);
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    setIsLoading(true);
    fetchAnimalInfo(identifiedAnimal);
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
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            style={{
              backgroundColor: isDarkMode ? '#fff' : '#000',
              color: isDarkMode ? '#000' : '#fff',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {animalInfo && (
            <button
              onClick={handleRecalculate}
              style={{
                backgroundColor: '#007aff',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease',
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : 'Recalculate'}
            </button>
          )}
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
              <Upload style={{ marginRight: '10px' }} /> Upload Image
              <input
                id="upload-image"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </label>

            {/* Capture Button for Mobile */}
            {isMobile && (
              <button
                onClick={handleCapture}
                style={{
                  backgroundColor: '#007aff',
                  color: '#fff',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease',
                }}>
                <Camera style={{ marginRight: '10px' }} /> Capture Image
              </button>
            )}
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
                src={animalInfo.thumbnail?.source || '/placeholder.jpg'}
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
              <p style={{ marginBottom: '0' }}>{animalInfo.extract}</p>
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
                    <li key={key}><strong>{key}:</strong> {value}</li>
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