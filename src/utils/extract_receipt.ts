import Tesseract from 'tesseract.js';


export const extractTextFromImage = async (file: File | string): Promise<string> => {
  try {
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m),
    });
    return data.text;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
};
