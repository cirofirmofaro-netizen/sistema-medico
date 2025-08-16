import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#2563eb' }}>
        🏥 Sistema de Plantão Médico
      </h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
        Sistema funcionando perfeitamente!
      </p>
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h2>✅ Status: Funcionando</h2>
        <p>Seu sistema está rodando corretamente!</p>
      </div>
    </div>
  )
}

export default App
