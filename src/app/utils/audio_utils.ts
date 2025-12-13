export const convertToWAV = async (audioBlob: Blob): Promise<Blob> => {
  // Проверяем наличие API
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) {
    throw new Error("Ваш браузер не поддерживает Web Audio API");
  }

  const audioContext = new AudioContext();

  try {
    // Используем современный arrayBuffer() вместо FileReader
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Декодируем аудио (тяжелая операция)
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Создаем WAV файл
    const wavBlob = createWAVBlob(audioBuffer, audioContext.sampleRate);
    return wavBlob;
  } finally {
    // ВАЖНО: Всегда закрываем контекст, иначе браузер запретит создание новых после 6 раз
    await audioContext.close();
  }
};

// 2. Создание WAV файла из AudioBuffer (без изменений логики, только типизация)
const createWAVBlob = (audioBuffer: AudioBuffer, sampleRate: number): Blob => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];

  let offset = 0;

  // Устанавливаем каналы
  for (let i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Записываем заголовок WAV (RIFF WAVE fmt data)
  writeString(view, offset, "RIFF");
  offset += 4;
  view.setUint32(offset, length - 8, true);
  offset += 4;
  writeString(view, offset, "WAVE");
  offset += 4;
  writeString(view, offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4; // Subchunk1Size
  view.setUint16(offset, 1, true);
  offset += 2; // AudioFormat (PCM)
  view.setUint16(offset, numOfChan, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * numOfChan * 2, true);
  offset += 4; // ByteRate
  view.setUint16(offset, numOfChan * 2, true);
  offset += 2; // BlockAlign
  view.setUint16(offset, 16, true);
  offset += 2; // BitsPerSample
  writeString(view, offset, "data");
  offset += 4;
  view.setUint32(offset, length - 44, true);
  offset += 4;

  // Записываем PCM данные (Interleaved)
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      // Клиппинг сигнала от -1 до 1
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      // Конвертация float32 -> int16
      const val = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, val, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};
