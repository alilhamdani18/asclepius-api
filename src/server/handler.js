const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const { savePredictionToFirestore, getHistoriesPredict } = require('../services/storeData');
// const InputError = require('./src/exceptions/InputError'); // Import InputError for error handling

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    // Validate image size
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

    // Predict using the model
    const { roundedScore, result, suggestion } = await predictClassification(model, image); // Use updated function result keys

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: result, // Ensure result is correctly used
      confidence: roundedScore,
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
    // Handle errors that occur during prediction
    console.error('Error during prediction:', error);

    // Handle InputError specifically
    // if (error instanceof InputError) {
    //   return h
    //     .response({
    //       status: 'fail',
    //       message: `Input error: ${error.message}`,
    //     })
    //     .code(400);
    // }

    // General error response
    return h
      .response({
        status: 'fail',
        message: 'Terjadi kesalahan dalam melakukan prediksi',
      })
      .code(400);
  }
}

async function getPredictHistories(request, h) {
  try {
    // Mendapatkan riwayat prediksi dari Firestore
    const histories = await getHistoriesPredict();

    // Mengirim respons dengan status sukses dan data riwayat
    return h
      .response({
        status: 'success',
        data: histories,
      })
      .code(200);
  } catch (error) {
    // Menangani error jika terjadi masalah dalam pengambilan riwayat prediksi
    console.error('Error during fetching prediction histories:', error);

    return h
      .response({
        status: 'fail',
        message: 'Terjadi kesalahan dalam mengambil riwayat prediksi',
      })
      .code(500);
  }
}

module.exports = { postPredictHandler, getPredictHistories };
