const tf = require('@tensorflow/tfjs-node');
// const InputError = require('./src/exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat().div(tf.scalar(255.0)); // Normalisasi ke [0, 1]

    // Prediksi dengan model
    const prediction = model.predict(tensor);
    const score = await prediction.data();

    tensor.dispose(); // Bebaskan memori tensor
    prediction.dispose(); // Bebaskan memori hasil prediksi

    // Log untuk melihat skor hasil prediksi
    console.log('Prediction Scores:', scores);

    const confidenceScore = Math.max(...score) * 100;
    const roundedScore = parseFloat(confidenceScore.toFixed(1));

    if (roundedScore <= 57.9) {
      result = 'Non-cancer'; // Jika score <= 57.9
      suggestion = 'Penyakit kanker tidak terdeteksi.';
    } else {
      result = 'Cancer'; // Jika score > 57.9
      suggestion = 'Segera periksa ke dokter!';
    }

    

    return {
      roundedScore,
      label,
      suggestion,
    };
  } catch (error) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictClassification;
