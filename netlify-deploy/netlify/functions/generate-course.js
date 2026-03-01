// Netlify Function: Generate course content with Claude AI
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt, slideCount, includeVideos, apiKey, simple } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt required' })
      };
    }

    if (!apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Claude API key required. Please add it in the Settings tab.'
        })
      };
    }

    // Handle simple text generation (for AI script/scene generation)
    if (simple) {
      console.log('Simple text generation request:', prompt);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929', // FIXED: Updated to current supported model
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      console.log('Claude API response status:', response.status);
      const responseText = await response.text();
      console.log('Claude API response:', responseText);

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      const content = data.content?.[0]?.text || 'Generation failed - no content returned';

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content.trim()
        })
      };
    }

    // Call Claude API to generate course
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929', // FIXED: Updated to current supported model
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Create a professional e-learning course based on this prompt:

"${prompt}"

Requirements:
- Number of slides: ${slideCount || 10}
- Include video scenes: ${includeVideos ? 'yes' : 'no'}

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "title": "Course Title",
  "description": "Brief description",
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle"
    },
    {
      "id": "slide-2", 
      "type": "content",
      "heading": "Section Heading",
      "content": "Main content text (2-3 sentences)",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "narration": "Natural voice narration (2-3 sentences, conversational)",
      "scene": {
        "background": "office/warehouse/outdoor/classroom/lab",
        "character": "professional-male/professional-female/trainer-male/trainer-female",
        "characterPose": "standing/pointing/presenting/demonstrating"
      }
    },
    {
      "id": "slide-3",
      "type": "video",
      "title": "Video Scene Title",
      "description": "What happens in this video",
      "narration": "Voice narration for video",
      "duration": 30,
      "scene": {
        "background": "warehouse",
        "character": "professional-male",
        "actions": ["points to equipment", "demonstrates procedure"]
      }
    },
    {
      "id": "slide-4",
      "type": "quiz",
      "question": "Quiz question?",
      "options": [
        {"text": "Option A", "correct": false},
        {"text": "Option B", "correct": true},
        {"text": "Option C", "correct": false},
        {"text": "Option D", "correct": false}
      ],
      "feedback": "Explanation of correct answer"
    }
  ]
}

Make narration natural and conversational for voice synthesis. Include mix of content, video, and quiz slides.`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Claude API error (${response.status}): ${errorText}. Check your API key is valid.`
        })
      };
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to parse AI response' })
      };
    }

    const courseData = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Server error: ${error.message}. Check Netlify function logs for details.`
      })
    };
  }
};
