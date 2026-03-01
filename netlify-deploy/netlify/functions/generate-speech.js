// Netlify Serverless Function to handle ElevenLabs API calls
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // ✅ Safe body parse
    let payload;
    try {
      payload = event.body ? JSON.parse(event.body) : null;
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid JSON body",
          details: e.message,
          hint: "Make sure you send JSON with Content-Type: application/json",
        }),
      };
    }

    if (!payload) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing request body",
          hint: "Expected { text, voiceId, apiKey }",
        }),
      };
    }

    const { text, voiceId, apiKey } = payload;

    if (!text || !voiceId || !apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let suggestion = 'Check your ElevenLabs account';
      if (response.status === 503) {
        suggestion = 'ElevenLabs servers are temporarily unavailable. Try again in a few minutes.';
      } else if (response.status === 401) {
        suggestion = 'Invalid ElevenLabs API key';
      } else if (response.status === 402) {
        suggestion = 'Insufficient ElevenLabs credits';
      } else if (response.status === 429) {
        suggestion = 'Rate limit exceeded - wait a moment and try again';
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText,
          suggestion: suggestion,
          requestId: errorText.match(/Request ID: ([A-Z0-9]+)/)?.[1] || 'N/A'
        })
      };
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: base64Audio,
        contentType: 'audio/mpeg'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
