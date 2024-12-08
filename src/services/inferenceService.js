const tf = require('@tensorflow/tfjs-node');
// const InputError = require('./src/exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat().div(tf.scalar(255.0)); // Normalisasi ke [0, 1]

    // Prediksi dengan model
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const classes = ['Cancer', 'Non-cancer'];

    const classResult = tf.argMax(prediction, 1).dataSync()[0];
    const label = classes[classResult];
    // const prediction = model.predict(tensor);
    // const score = await prediction.data();

    // Ambil confidenceScore sebagai probabilitas tertinggi
    // const confidenceScore = Math.max(...score);

    // Tentukan hasil berdasarkan ambang batas confidence 0.5
    // const label = confidenceScore > 0.5 ? 'Cancer' : 'Non-cancer';

    // Tentukan saran berdasarkan hasil
    let suggestion;
    if (label === 'Cancer') {
      suggestion = 'Segera periksa ke dokter!';
    } else {
      suggestion = 'Penyakit kanker tidak terdeteksi.';
    }

    return {
      confidenceScore,
      label,
      suggestion,
    };
  } catch (error) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictClassification;
