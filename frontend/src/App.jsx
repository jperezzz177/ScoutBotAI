import { useState } from 'react';
import axios from 'axios';

function App() {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getComparison = async () => {
    if(!p1 || !p2) return setError("Please enter two names.");
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://127.0.0.1:8000/compare', { player1: p1, player2: p2 });
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 429){
        setError("Slow down! You've reached the scouting limit. Try again in a minute.")
      }else{
        setError("The scouting department is busy. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setData(null);
    setP1('');
    setP2('');
    setError(null);
    };


  return(
<div style={{ textAlign: 'center', marginTop: '50px', backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ fontSize: '3rem', color: '#00ff88' }}>ScoutBot AI</h1>
      <p>Professional AI-driven player comparison</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input value={p1} placeholder='Player 1' onChange={(e) => setP1(e.target.value)} style={inputStyle} />
        <span style={{ margin: '0 10px', fontWeight: 'bold' }}>VS</span>
        <input value={p2} placeholder='Player 2' onChange={(e) => setP2(e.target.value)} style={inputStyle} />
      </div>

      <button onClick={getComparison} disabled={loading} style={buttonStyle}>
        {loading ? 'Scouting...' : 'Analyze Matchup'}
      </button>

      {data && <button onClick={handleClear} style={{ ...buttonStyle, background: '#444', marginLeft: '10px' }}>Clear</button>}

      {error && <p style={{ color: '#ff4444' }}>{error}</p>}

      {data && (
        <div style={resultCardStyle}>

          <h2>Scout's Verdict</h2>
          <p style={{ fontStyle: 'italic', color: '#ccc', marginBottom: '30px' }}>"{data.verdict}"</p>


          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '15px', borderRadius: '10px', background: '#252525' }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p><strong>Age:</strong> {data.p1_info?.age}</p>
              <p><strong>Club:</strong> {data.p1_info?.club}</p>
              <p><strong>Value:</strong> {data.p1_info?.value}</p>
              <p><strong>Foot:</strong> {data.p1_info?.foot}</p>
            </div>
            <div style={{ borderLeft: '1px solid #444', height: '100px', margin: '0 20px' }}></div>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <p>{data.p2_info?.age} <strong>:Age</strong></p>
              <p>{data.p2_info?.club} <strong>:Club</strong></p>
              <p>{data.p2_info?.value} <strong>:Value</strong></p>
              <p>{data.p2_info?.foot} <strong>:Foot</strong></p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={traitsBoxStyle}>
              <h4 style={{ color: '#00ff88', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Pros & Cons</h4>
              <ul style={listStyle}>
                {data.p1_traits?.strengths.map(s => <li key={s}>✅ {s}</li>)}
                {data.p1_traits?.weaknesses.map(w => <li key={w}>❌ {w}</li>)}
              </ul>
            </div>
            <div style={traitsBoxStyle}>
              <h4 style={{ color: '#00ff88', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Pros & Cons</h4>
              <ul style={listStyle}>
                {data.p2_traits?.strengths.map(s => <li key={s}>✅ {s}</li>)}
                {data.p2_traits?.weaknesses.map(w => <li key={w}>❌ {w}</li>)}
              </ul>
            </div>
          </div>
          

          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #00ff88' }}>
                <th style={centeredHeaderStyle}>
                  <img src={data.p1_image} alt={p1} style={photoStyle} />
                  <span>{p1}</span>
                </th>
                <th style={tableHeaderStyle}>Attribute</th>
                <th style={centeredHeaderStyle}>
                  <img src={data.p2_image} alt={p2} style={photoStyle} />
                  <span>{p2}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data.p1_stats).map(attr => (
                <tr key={attr} style={{ borderBottom: '1px solid #333' }}>
                  <td style={statValueStyle(data.p1_stats[attr])}>{data.p1_stats[attr]}</td>
                  <td style={{ padding: '10px', textTransform: 'uppercase', fontSize: '0.8rem', color: '#888' }}>{attr}</td>
                  <td style={statValueStyle(data.p2_stats[attr])}>{data.p2_stats[attr]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#1e1e1e', color: 'white', outline: 'none' };
const buttonStyle = { padding: '12px 24px', cursor: 'pointer', background: '#00ff88', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold' };
const resultCardStyle = { marginTop: '40px', padding: '30px', borderRadius: '15px', backgroundColor: '#1e1e1e', maxWidth: '700px', margin: '40px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const tableHeaderStyle = { padding: '15px', textTransform: 'capitalize', fontSize: '1.2rem' };

const centeredHeaderStyle = {
  padding: '15px',
  textTransform: 'capitalize',
  fontSize: '1.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const statValueStyle = (val) => ({ padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: val > 85 ? '#00ff88' : 'white' });

const photoStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #00ff88',
  marginBottom: '10px'
};

const traitsBoxStyle = { flex: 1, padding: '15px', backgroundColor: '#252525', borderRadius: '10px', textAlign: 'left' };
const listStyle = { listStyle: 'none', padding: 0, fontSize: '0.85rem', lineHeight: '1.8' };

export default App;