import express from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { prompt, context } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const apiKey = process.env.OPENROUTER_APIKEY;

        if (!apiKey) {
            logger.error('AI', 'OPENROUTER_APIKEY is missing');
            return res.status(500).json({ message: 'AI service is not configured' });
        }

        // Construct the messages for the chat completion
        const messages = [
            {
                role: "system",
                content: `You are a helpful AI writing assistant for students. You help them write stories, essays, and project descriptions.
Rules:
1. Use the provided "Current Story Content" as context. If the user asks to improve or rewrite, stick to the facts in the content.
2. Do NOT invent specific names (companies, universities, people) unless provided in the prompt or context. Use placeholders like "[Company Name]" or "[University]" if details are missing.
3. Keep the tone encouraging, professional, yet authentic to a student's voice.
4. Return ONLY the generated text, no conversational filler.`
            }
        ];

        if (context) {
            messages.push({
                role: "user",
                content: `[Current Story Content Start]\n${context}\n[Current Story Content End]\n\n(Use the above content as context/source material)`
            });
        }

        messages.push({
            role: "user",
            content: prompt
        });

        logger.info('AI', 'Sending request to OpenRouter', { promptLength: prompt.length });

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'x-ai/grok-4.1-fast:free', // Using a standard model, can be changed
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
                    'X-Title': 'KL Unity', // Required by OpenRouter
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedText = response.data.choices[0].message.content;

        logger.info('AI', 'Received response from OpenRouter');

        res.json({ text: generatedText });

    } catch (error) {
        logger.error('AI', 'Error generating content', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(500).json({
            message: 'Failed to generate content',
            error: error.response?.data?.error?.message || error.message
        });
    }
});

export default router;
