const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const { savePredictionToFirestore } = require('../services/storeData');

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    // Validasi ukuran gambar
    if (!image) {
      console.log('Image payload is missing');
      return h
        .response({
          status: 'fail',
          message: 'Image payload is missing',
        })
        .code(400);
    }

    if (image.length > 1000000) {
      console.log('Payload content length greater than maximum allowed: 1000000');
      return h
        .response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 1000000',
        })
        .code(413);
    }

    // Prediksi menggunakan model
    const { confidenceScore, label, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    label = confidenceScore > 0.5 ? 'Cancer' : 'Non-cancer';

    const data = {
      id: id,
      result: label,
      confidence: confidenceScore,
      suggestion: suggestion,
      createdAt: createdAt,
    };
    await savePredictionToFirestore(data);

    console.log('Prediction successful, sending response');
    return h
      .response({
        status: 'success',
        message: 'Model is predicted successfully',
        data,
      })
      .code(201);
  } catch (error) {
    // Tangani error jika terjadi masalah dalam prediksi
    console.error('Error during prediction:', error);

    console.log('Error during prediction, sending error response');
    return h
      .response({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      })
      .code(400);
  }
}

module.exports = postPredictHandler;
