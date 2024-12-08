const tf = require('@tensorflow/tfjs-node');
// const InputError = require('./src/exceptions/InputError');

async function predictClassification(model, image) {
  try {
    // Decode and preprocess the image
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat().div(tf.scalar(255.0)); // Normalize to [0, 1]

    // Make prediction with the model
    const prediction = model.predict(tensor);
    const scores = await prediction.data();

    tensor.dispose(); // Free tensor memory
    prediction.dispose(); // Free prediction memory

    // Log to see prediction scores
    console.log('Prediction Scores:', scores);

    const confidenceScore = Math.max(...scores);
    const roundedScore = parseFloat((confidenceScore * 100).toFixed(1));

    let result;
    let suggestion;

    if (roundedScore <= 57.9) {
      result = 'Non-cancer';
      suggestion = 'Penyakit kanker tidak terdeteksi.';
    } else {
      result = 'Cancer';
      suggestion = 'Segera periksa ke dokter!';
    }

    return {
      roundedScore,
      result,
      suggestion,
    };
  } catch (error) {
    throw `Terjadi kesalahan input: ${error.message}`;
  }
}

module.exports = predictClassification;
