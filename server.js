import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import cors from 'cors'; 

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();

app.post('/synthesize', async (req, res) => {
    const text = req.body.text;
    const speechFile = path.resolve('./speech.mp3');

    try {
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile);
        res.sendFile(speechFile);
    } catch (error) {
        res.status(500).send('Error in text-to-speech conversion');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));