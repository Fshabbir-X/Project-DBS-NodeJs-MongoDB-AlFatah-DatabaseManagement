const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const dbName = 'Al-Fatah';

// Define the root route
app.get('/', (req, res) => {
    res.send('Welcome to Al-Fatah Feedback System');
});

// Connect to MongoDB
MongoClient.connect(url)
    .then(client => {
        const db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        // Endpoint to submit feedback
        app.post('/submit_feedback', async (req, res) => {
            const feedback = req.body;
            console.log('Received feedback:', feedback);

            try {
                const collection = db.collection('feedback');
                const result = await collection.insertOne(feedback);
                console.log('Feedback added:', result);
                res.status(200).json({ message: 'Feedback added successfully' });
            } catch (err) {
                console.error('Error adding feedback:', err);
                res.status(500).json({ error: err.message });
            }
        });

        // Endpoint to view feedback
        app.get('/view_feedback/:feedback_id', async (req, res) => {
            const feedbackId = req.params.feedback_id;
            console.log('Viewing feedback with ID:', feedbackId);

            try {
                const collection = db.collection('feedback');
                const feedback = await collection.findOne({ feedback_id: feedbackId });
                if (feedback) {
                    res.status(200).json(feedback);
                } else {
                    res.status(404).json({ error: 'Feedback not found' });
                }
            } catch (err) {
                console.error('Error viewing feedback:', err);
                res.status(500).json({ error: err.message });
            }
        });

        // Endpoint to update feedback
        app.post('/update_feedback', async (req, res) => {
            const feedback = req.body;
            console.log('Updating feedback:', feedback);

            try {
                const collection = db.collection('feedback');
                const result = await collection.updateOne(
                    { feedback_id: feedback.feedback_id },
                    { $set: feedback }
                );
                if (result.modifiedCount > 0) {
                    res.status(200).json({ message: 'Feedback updated successfully' });
                } else {
                    res.status(404).json({ error: 'Feedback not found' });
                }
            } catch (err) {
                console.error('Error updating feedback:', err);
                res.status(500).json({ error: err.message });
            }
        });

        // Endpoint to delete feedback
        app.delete('/delete_feedback/:feedback_id', async (req, res) => {
            const feedbackId = req.params.feedback_id;
            console.log('Deleting feedback with ID:', feedbackId);

            try {
                const collection = db.collection('feedback');
                const result = await collection.deleteOne({ feedback_id: feedbackId });
                if (result.deletedCount > 0) {
                    res.status(200).json({ message: 'Feedback deleted successfully' });
                } else {
                    res.status(404).json({ error: 'Feedback not found' });
                }
            } catch (err) {
                console.error('Error deleting feedback:', err);
                res.status(500).json({ error: err.message });
            }
        });

        // Start the server after the connection is established
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with a failure code
    });
