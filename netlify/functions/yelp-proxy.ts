import { Handler } from '@netlify/functions';

const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_API_URL = 'https://api.yelp.com/ai/chat/v2';

export const handler: Handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Check if API key is configured
    if (!YELP_API_KEY) {
        console.error('YELP_API_KEY is not configured');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not configured' })
        };
    }

    try {
        const requestBody = JSON.parse(event.body || '{}');

        const response = await fetch(YELP_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(data)
        };
    } catch (error: any) {
        console.error('Error calling Yelp API:', {
            message: error.message,
            stack: error.stack,
            response: error.response // If it's an axios error or similar
        });
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};
