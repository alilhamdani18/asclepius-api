const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore
const firestore = new Firestore({
  projectId: 'submissionmlgc-m-alil-hamdani',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Nama koleksi untuk menyimpan prediksi
const COLLECTION_NAME = 'predictions';

/**
 * Menyimpan data prediksi ke Firestore
 * @param {Object} predictionData - Data prediksi yang akan disimpan
 * @param {string} predictionData.id - ID prediksi (UUID)
 * @param {string} predictionData.result - Hasil prediksi (Cancer atau Non-cancer)
 * @param {string} predictionData.suggestion - Saran berdasarkan hasil prediksi
 * @param {string} predictionData.createdAt - Timestamp saat prediksi dibuat
 */
const savePredictionToFirestore = async (predictionData) => {
  try {
    const collectionPrediction = firestore.collection(COLLECTION_NAME);
    const documentRef = collectionPrediction.doc(predictionData.id);

    // Simpan data ke Firestore
    await documentRef.set({
      id: predictionData.id,
      result: predictionData.result,
      suggestion: predictionData.suggestion,
      createdAt: predictionData.createdAt,
    });

    console.log(`Prediction with ID ${predictionData.id} saved successfully.`);
  } catch (error) {
    console.error('Error saving prediction to Firestore:', error);
    throw new Error('Failed to save prediction to Firestore.');
  }
};

const getHistoriesPredict = async function getPredictionHistoriesFromFirestore() {
  try {
    const snapshot = await firestore.collection('predictions').get();
    const histories = [];
    snapshot.forEach((doc) => {
      histories.push({ id: doc.id, ...doc.data() });
    });
    return histories;
  } catch (error) {
    console.error('Error during fetching prediction histories from Firestore:', error);
    throw new Error('Failed to fetch prediction histories');
  }
};

module.exports = { savePredictionToFirestore, getHistoriesPredict };
