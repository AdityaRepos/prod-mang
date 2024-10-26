
'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      router.push('/products');
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center', color: '#000'}}>Brand Name</h1>
      <p style={{ textAlign: 'center', color: '#000' }}>Redirecting to the Products List...</p>
      <Box sx={{ width: '100%', maxWidth: '500px', mt: 4 }}>
        <LinearProgress />
      </Box>
    </div>
  );
}
